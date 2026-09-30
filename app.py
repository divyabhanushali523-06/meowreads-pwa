from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import random
import os
import mysql.connector
import werkzeug.security

app = Flask(__name__, static_folder='.')
CORS(app)

def get_db_connection():
    config = {
        'host': os.environ.get('DB_HOST', 'localhost'),
        'user': os.environ.get('DB_USER', 'root'),
        'password': os.environ.get('DB_PASSWORD', 'root'),
        'database': os.environ.get('DB_NAME', 'defaultdb'),
        'port': int(os.environ.get('DB_PORT', 3306))
    }
    
    if config['host'] != 'localhost':
        config['ssl_disabled'] = False
        
    return mysql.connector.connect(**config)

def init_db():
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        # Create writers table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS writers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            username VARCHAR(50) NOT NULL UNIQUE,
            phone_number VARCHAR(20),
            birthdate DATE,
            password_hash VARCHAR(255) NOT NULL,
            bio TEXT,
            avatar_url VARCHAR(255) DEFAULT 'https://cdn-icons-png.flaticon.com/512/616/616430.png',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Create users table for Readers
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            username VARCHAR(50) NOT NULL UNIQUE,
            phone_number VARCHAR(20),
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        db.commit()
        cursor.close()
        db.close()
        print("Database tables initialized successfully!")
    except Exception as e:
        print("Database auto-init warning:", str(e))

init_db()

otp_store = {}

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Handle user dashboard filename mismatches automatically
    if path in ['userdashboard.html', 'user_dashboard.html']:
        for fname in ['user_dashboard.html', 'userdashboard.html']:
            if os.path.exists(fname):
                return send_from_directory('.', fname)

    # Handle writer dashboard filename mismatches automatically
    if path in ['writerdashboard.html', 'writer_dashboard.html']:
        for fname in ['writer_dashboard.html', 'writerdashboard.html']:
            if os.path.exists(fname):
                return send_from_directory('.', fname)

    # Serve requested static file if it exists
    if os.path.exists(path):
        return send_from_directory('.', path)
        
    return send_from_directory('.', 'index.html')

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
        
        query = "INSERT INTO writers (full_name, username, phone_number, password_hash) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (full_name, username, phone_number, hashed_password))
        db.commit()
        
        cursor.close()
        db.close()
        return jsonify({'success': True, 'message': 'Writer registered successfully!'})
    except Exception as err:
        return jsonify({'success': False, 'message': f"Server Error: {str(err)}"}), 500

# 3. Register Reader/User Endpoint
@app.route('/api/register-user', methods=['POST'])
def register_user():
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
        
        query = "INSERT INTO users (full_name, username, phone_number, password_hash) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (full_name, username, phone_number, hashed_password))
        db.commit()
        
        cursor.close()
        db.close()
        return jsonify({'success': True, 'message': 'User registered successfully!'})
    except Exception as err:
        return jsonify({'success': False, 'message': f"Server Error: {str(err)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)