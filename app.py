from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import random
import os
import mysql.connector
import werkzeug.security

app = Flask(__name__, static_folder='.')
CORS(app)

def get_db_connection():
    # Read environment variables dynamically per connection
    config = {
        'host': os.environ.get('DB_HOST', 'localhost'),
        'user': os.environ.get('DB_USER', 'root'),
        'password': os.environ.get('DB_PASSWORD', 'root'),
        'database': os.environ.get('DB_NAME', 'defaultdb'),
        'port': int(os.environ.get('DB_PORT', 3306))
    }
    
    # Enforce SSL required for remote databases (Aiven cloud)
    if config['host'] != 'localhost':
        config['ssl_mode'] = 'REQUIRED'
        
    return mysql.connector.connect(**config)

otp_store = {}

# Serve HTML files directly from root folder
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# 1. OTP Endpoints
@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    try:
        data = request.get_json(force=True, silent=True) or {}
        phone = data.get('phone_number')
        if not phone:
            return jsonify({'error': 'Phone number required'}), 400

        code = str(random.randint(1000, 9999))
        otp_store[phone] = code
        print(f"\n==========================================\n MOCK OTP FOR {phone}: [{code}] \n==========================================\n")
        return jsonify({'message': 'OTP sent successfully!', 'debug_otp': code})
    except Exception as e:
        print("Error in send_otp:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json(force=True, silent=True) or {}
        phone = data.get('phone_number')
        entered_code = data.get('otp')

        if otp_store.get(phone) == entered_code:
            if phone in otp_store:
                del otp_store[phone]
            return jsonify({'success': True, 'message': 'Verified successfully!'})
        return jsonify({'success': False, 'message': 'Invalid OTP code'}), 400
    except Exception as e:
        print("Error in verify_otp:", str(e))
        return jsonify({'success': False, 'message': str(e)}), 500

# 2. Register Writer Endpoint
@app.route('/api/register-writer', methods=['POST'])
def register_writer():
    try:
        data = request.get_json(force=True, silent=True) or {}
        full_name = data.get('full_name', '')
        username = data.get('username', '')
        phone_number = data.get('phone_number', '')
        password = data.get('password', '')

        if not password or not username:
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        hashed_password = werkzeug.security.generate_password_hash(password)

        db = get_db_connection()
        cursor = db.cursor()
        
        query = """
        INSERT INTO writers (full_name, username, phone_number, password_hash)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (full_name, username, phone_number, hashed_password))
        db.commit()
        
        cursor.close()
        db.close()
        return jsonify({'success': True, 'message': 'Writer registered successfully!'})
    except mysql.connector.Error as err:
        print("Database Registration Error:", err)
        return jsonify({'success': False, 'message': f"Database Error: {str(err)}"}), 500
    except Exception as err:
        print("Registration Error:", err)
        return jsonify({'success': False, 'message': f"Server Error: {str(err)}"}), 500

# 3. Upload Book Endpoint
@app.route('/api/add-book', methods=['POST'])
def add_book():
    try:
        data = request.get_json(force=True, silent=True) or {}
        title = data.get('title')
        author_name = data.get('author') or data.get('author_name')
        genre = data.get('genre', 'General')
        synopsis = data.get('description') or data.get('synopsis', 'No synopsis provided.')
        cover_url = data.get('cover_image_url') or data.get('cover_url', 'https://via.placeholder.com/150')
        buy_price = data.get('price') or data.get('buy_price', 0.0)
        writer_id = data.get('writer_id', 1)

        if not title or not author_name:
            return jsonify({'success': False, 'message': 'Title and Author are required'}), 400

        db = get_db_connection()
        cursor = db.cursor()
        
        query = """
        INSERT INTO books (title, author_name, genre, synopsis, cover_url, buy_price, writer_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (title, author_name, genre, synopsis, cover_url, buy_price, writer_id))
        db.commit()
        
        cursor.close()
        db.close()
        return jsonify({'success': True, 'message': 'Book added to MySQL successfully!'})
    except mysql.connector.Error as err:
        print("Database Add Book Error:", err)
        return jsonify({'success': False, 'message': f"Database Error: {str(err)}"}), 500
    except Exception as err:
        print("Add Book Error:", err)
        return jsonify({'success': False, 'message': f"Server Error: {str(err)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)