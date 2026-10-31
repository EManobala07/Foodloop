from models.db import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash

class UserModel:
    @staticmethod
    def create_user(name, email, password, role, phone, organization_name=None):
        conn = get_db_connection()
        hashed_pw = generate_password_hash(password)
        try:
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO users (name, email, password, role, phone, organization_name, is_verified)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                is_verified = False if role == 'ngo' else True
                cursor.execute(sql, (name, email, hashed_pw, role, phone, organization_name, is_verified))
                return cursor.lastrowid
        finally:
            conn.close()

    @staticmethod
    def get_by_email(email):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
                return cursor.fetchone()
        finally:
            conn.close()

    @staticmethod
    def get_by_id(user_id):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT user_id, name, email, role, phone, organization_name, is_verified, created_at FROM users WHERE user_id = %s", (user_id,))
                return cursor.fetchone()
        finally:
            conn.close()

    @staticmethod
    def verify_password(stored_password, provided_password):
        if stored_password.startswith('pbkdf2:') or stored_password.startswith('scrypt:'):
            return check_password_hash(stored_password, provided_password)
        # Fallback for plain / demo hex hashes
        import hashlib
        return hashlib.sha256(provided_password.encode()).hexdigest() == stored_password or stored_password == provided_password

    @staticmethod
    def get_all_users():
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT user_id, name, email, role, phone, organization_name, is_verified, created_at FROM users ORDER BY created_at DESC")
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def update_verification_status(user_id, is_verified):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("UPDATE users SET is_verified = %s WHERE user_id = %s", (is_verified, user_id))
                return cursor.rowcount > 0
        finally:
            conn.close()
