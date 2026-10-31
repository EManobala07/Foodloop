from flask import Blueprint, request, jsonify, session
from models.food_model import FoodModel
from models.reservation_model import ReservationModel
from models.waste_model import WasteModel

student_bp = Blueprint('student', __name__)

@student_bp.route('/surplus-food', methods=['GET'])
def list_available_food():
    category = request.args.get('category')
    food_type = request.args.get('food_type')
    search = request.args.get('search')
    items = FoodModel.get_available_food(category, food_type, search)
    return jsonify({"success": True, "items": items})

@student_bp.route('/reservations', methods=['POST'])
def make_reservation():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Authentication required"}), 401
    
    data = request.get_json() or {}
    food_id = data.get('food_id')
    quantity = int(data.get('quantity', 1))

    if not food_id or quantity <= 0:
        return jsonify({"success": False, "error": "Invalid food item or quantity"}), 400

    result, err = ReservationModel.create_reservation(user_id, food_id, quantity)
    if err:
        return jsonify({"success": False, "error": err}), 400

    return jsonify({
        "success": True, 
        "message": f"Successfully reserved {quantity} portion(s). Use code {result['verification_code']} at pickup.",
        "reservation": result
    }), 201

@student_bp.route('/reservations', methods=['GET'])
def get_user_reservations():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Authentication required"}), 401
    
    reservations = ReservationModel.get_by_user(user_id)
    return jsonify({"success": True, "reservations": reservations})

@student_bp.route('/reservations/<int:reservation_id>/cancel', methods=['POST'])
def cancel_reservation(reservation_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Authentication required"}), 401

    ok, msg = ReservationModel.cancel_reservation(reservation_id, user_id)
    if not ok:
        return jsonify({"success": False, "error": msg}), 400
    return jsonify({"success": True, "message": msg})

@student_bp.route('/report-waste', methods=['POST'])
def report_waste():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Authentication required"}), 401

    data = request.get_json() or {}
    food_name = data.get('food_name')
    quantity = float(data.get('quantity', 1))
    location = data.get('location', 'Campus Food Court')
    reason = data.get('reason', 'Observed uneaten leftovers')
    meal_type = data.get('meal_type', 'Lunch')

    report_id = WasteModel.create_report(
        food_name=food_name,
        quantity=quantity,
        quantity_prepared=quantity * 2,
        unit='kg',
        meal_type=meal_type,
        location=location,
        waste_reason=reason,
        image_url=data.get('image_url'),
        report_date=data.get('date') or 'NOW()',
        reported_by=user_id
    )
    return jsonify({"success": True, "message": "Waste report recorded", "report_id": report_id}), 201
