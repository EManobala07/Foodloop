from flask import Flask, render_template, send_from_directory, jsonify
from config import Config
from controllers.auth_controller import auth_bp
from controllers.student_controller import student_bp
from controllers.canteen_controller import canteen_bp
from controllers.hostel_controller import hostel_bp
from controllers.ngo_controller import ngo_bp
from controllers.admin_controller import admin_bp

app = Flask(__name__, template_folder='views', static_folder='static')
app.config.from_object(Config)

# Register Blueprints for REST APIs and MVC routes
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(student_bp, url_prefix='/api/student')
app.register_blueprint(canteen_bp, url_prefix='/api/canteen')
app.register_blueprint(hostel_bp, url_prefix='/api/hostel')
app.register_blueprint(ngo_bp, url_prefix='/api/ngo')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/student-dashboard')
def student_dashboard():
    return render_template('student_dashboard.html')

@app.route('/canteen-dashboard')
def canteen_dashboard():
    return render_template('canteen_dashboard.html')

@app.route('/hostel-dashboard')
def hostel_dashboard():
    return render_template('hostel_dashboard.html')

@app.route('/ngo-dashboard')
def ngo_dashboard():
    return render_template('ngo_dashboard.html')

@app.route('/admin-dashboard')
def admin_dashboard():
    return render_template('admin_dashboard.html')

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "app": "FOODLOOP", "version": "1.0.0"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
