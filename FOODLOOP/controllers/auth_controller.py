from flask import Blueprint, request, jsonify, session, render_template, redirect, url_for
from models.user_model import UserModel

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() if request.is_json else request.form
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'student')
    phone = data.get('phone', '').strip()
    org = data.get('organization_name', '').strip()

    if not name or not email or not password or not phone:
        return jsonify({"success": False, "error": "All required fields must be filled"}), 400

    if role not in ['student', 'canteen', 'hostel', 'ngo', 'admin']:
        return jsonify({"success": False, "error": "Invalid role specified"}), 400

    existing = UserModel.get_by_email(email)
    if existing:
        return jsonify({"success": False, "error": "An account with this email already exists"}), 409

    user_id = UserModel.create_user(name, email, password, role, phone, org)
    session['user_id'] = user_id
    session['user_role'] = role
    session['user_name'] = name

    return jsonify({
        "success": True, 
        "message": "Account created successfully", 
        "user": {"user_id": user_id, "name": name, "email": email, "role": role}
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() if request.is_json else request.form
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = UserModel.get_by_email(email)
    if not user or not UserModel.verify_password(user['password'], password):
        return jsonify({"success": False, "error": "Invalid email or password"}), 401

    session['user_id'] = user['user_id']
    session['user_role'] = user['role']
    session['user_name'] = user['name']

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "user_id": user['user_id'],
            "name": user['name'],
            "email": user['email'],
            "role": user['role'],
            "organization_name": user.get('organization_name'),
            "is_verified": user.get('is_verified', True)
        }
    })

@auth_bp.route('/logout', methods=['POST', 'GET'])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"authenticated": False}), 401
    user = UserModel.get_by_id(user_id)
    return jsonify({"authenticated": True, "user": user})
