from flask import Blueprint, request, jsonify, session
from models.user_model import UserModel
from models.waste_model import WasteModel
from models.db import get_db_connection

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/overview', methods=['GET'])
def get_admin_overview():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Users counts
            cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
            user_counts = {r['role']: r['count'] for r in cursor.fetchall()}

            # Listings count
            cursor.execute("SELECT COUNT(*) as total_listings, SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) as active_listings FROM food_items")
            listings_stat = cursor.fetchone()

            # Reservations count
            cursor.execute("SELECT COUNT(*) as total_requests, SUM(quantity) as total_servings_reserved FROM reservations")
            reservations_stat = cursor.fetchone()

            # Waste and Prepared
            cursor.execute("SELECT COALESCE(SUM(quantity), 0) as total_wasted, COALESCE(SUM(quantity_prepared), 0) as total_prepared FROM waste_reports")
            waste_stat = cursor.fetchone()

            # Donations count
            cursor.execute("SELECT COUNT(*) as total_donations, COALESCE(SUM(quantity), 0) as total_donated_servings, COALESCE(SUM(beneficiaries_fed), 0) as beneficiaries_fed FROM donations")
            donations_stat = cursor.fetchone()

            total_wasted = float(waste_stat['total_wasted'])
            total_prepared = float(waste_stat['total_prepared']) if float(waste_stat['total_prepared']) > 0 else (total_wasted + 120.0)
            waste_percentage = round((total_wasted / total_prepared) * 100, 2) if total_prepared > 0 else 0.0

            return jsonify({
                "success": True,
                "overview": {
                    "total_students": user_counts.get('student', 0),
                    "total_canteens": user_counts.get('canteen', 0),
                    "total_hostels": user_counts.get('hostel', 0),
                    "active_ngos": user_counts.get('ngo', 0),
                    "total_food_listings": listings_stat['total_listings'],
                    "active_food_listings": listings_stat['active_listings'],
                    "total_food_requests": reservations_stat['total_requests'],
                    "total_food_donated_servings": donations_stat['total_donated_servings'],
                    "beneficiaries_fed": donations_stat['beneficiaries_fed'],
                    "total_food_wasted_kg": total_wasted,
                    "total_food_prepared_kg": total_prepared,
                    "waste_percentage": waste_percentage,
                    "total_food_saved_kg": round((float(reservations_stat['total_servings_reserved'] or 0) * 0.4) + (float(donations_stat['total_donated_servings']) * 0.4), 1)
                }
            })
    finally:
        conn.close()

@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    users = UserModel.get_all_users()
    return jsonify({"success": True, "users": users})

@admin_bp.route('/users/<int:user_id>/verify', methods=['PUT'])
def verify_user(user_id):
    data = request.get_json() or {}
    status = bool(data.get('is_verified', True))
    ok = UserModel.update_verification_status(user_id, status)
    return jsonify({"success": ok, "message": "Verification status updated"})
