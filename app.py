from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import random
import os
import mysql.connector
import werkzeug.security

app = Flask(__name__, static_folder='.')
CORS(app)

DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', 'root'),
    'database': os.environ.get('DB_NAME', 'defaultdb'),
    'port': int(os.environ.get('DB_PORT', 3306))
}

def get_db_connection():
    config = DB_CONFIG.copy()
    # Force SSL for cloud database hosts like Aiven
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
    data = request.json or {}
    phone = data.get('phone_number')
    if not phone:
        return jsonify({'error': 'Phone number required'}), 400

    code = str(random.randint(1000, 9999))
    otp_store[phone] = code
    print(f"\n==========================================\n MOCK OTP FOR {phone}: [{code}] \n==========================================\n")
    return jsonify({'message': 'OTP sent successfully!', 'debug_otp': code})

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json or {}
    phone = data.get('phone_number')
    entered_code = data.get('otp')

    if otp_store.get(phone) == entered_code:
        del otp_store[phone]
        return jsonify({'success': True, 'message': 'Verified successfully!'})
    return jsonify({'success': False, 'message': 'Invalid OTP code'}), 400

# 2. Register Writer Endpoint (NO EMAIL COLUMN)
@app.route('/api/register-writer', methods=['POST'])
def register_writer():
    data = request.json or {}
    full_name = data.get('full_name')
    username = data.get('username')
    phone_number = data.get('phone_number')
    password = data.get('password')

    if not password or not username:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400

    hashed_password = werkzeug.security.generate_password_hash(password)

    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        # 4 columns matching 4 values (full_name, username, phone_number, password_hash)
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
        print("Registration Error:", err)
        return jsonify({'success': False, 'message': str(err)}), 500

# 3. Upload Book Endpoint
@app.route('/api/add-book', methods=['POST'])
def add_book():
    data = request.json or {}
    title = data.get('title')
    author_name = data.get('author') or data.get('author_name')
    genre = data.get('genre', 'General')
    synopsis = data.get('description') or data.get('synopsis', 'No synopsis provided.')
    cover_url = data.get('cover_image_url') or data.get('cover_url', 'https://via.placeholder.com/150')
    buy_price = data.get('price') or data.get('buy_price', 0.0)
    writer_id = data.get('writer_id', 1)

    if not title or not author_name:
        return jsonify({'success': False, 'message': 'Title and Author are required'}), 400

    try:
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
        print("Add Book Error:", err)
        return jsonify({'success': False, 'message': str(err)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)