from flask import Blueprint, request, jsonify, session
from models.food_model import FoodModel
from models.reservation_model import ReservationModel

canteen_bp = Blueprint('canteen', __name__)

@canteen_bp.route('/food-items', methods=['POST'])
def add_surplus_food():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    data = request.get_json() or {}
    food_id = FoodModel.create_food_item(
        name=data.get('food_name'),
        description=data.get('description', ''),
        category=data.get('category', 'Meals'),
        quantity=int(data.get('quantity', 1)),
        unit=data.get('unit', 'servings'),
        image_url=data.get('image_url'),
        pickup_location=data.get('pickup_location'),
        prepared_at=data.get('prepared_at'),
        expiry_time=data.get('expiry_time'),
        allergen_info=data.get('allergen_info', 'None'),
        food_type=data.get('food_type', 'Vegetarian'),
        uploaded_by=user_id
    )
    return jsonify({"success": True, "message": "Surplus food listed successfully", "food_id": food_id}), 201

@canteen_bp.route('/my-listings', methods=['GET'])
def get_canteen_listings():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    listings = FoodModel.get_by_canteen(user_id)
    return jsonify({"success": True, "listings": listings})

@canteen_bp.route('/reservations', methods=['GET'])
def get_canteen_reservations():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    reservations = ReservationModel.get_by_canteen(user_id)
    return jsonify({"success": True, "reservations": reservations})

@canteen_bp.route('/reservations/<int:reservation_id>/verify', methods=['POST'])
def verify_pickup(reservation_id):
    data = request.get_json() or {}
    code = data.get('verification_code')
    ok, msg = ReservationModel.mark_collected(reservation_id, code)
    if not ok:
        return jsonify({"success": False, "error": msg}), 400
    return jsonify({"success": True, "message": msg})

@canteen_bp.route('/food-items/<int:food_id>/status', methods=['PUT'])
def update_item_status(food_id):
    data = request.get_json() or {}
    status = data.get('status')
    if status not in ['available', 'reserved', 'collected', 'expired']:
        return jsonify({"success": False, "error": "Invalid status"}), 400
    ok = FoodModel.update_status(food_id, status)
    return jsonify({"success": ok, "message": f"Status updated to {status}"})
