from flask import Blueprint, request, jsonify, session
from models.food_model import FoodModel
from models.donation_model import DonationModel
from models.user_model import UserModel

ngo_bp = Blueprint('ngo', __name__)

@ngo_bp.route('/available-surplus', methods=['GET'])
def get_surplus_for_ngo():
    items = FoodModel.get_available_food()
    return jsonify({"success": True, "items": items})

@ngo_bp.route('/request-food', methods=['POST'])
def request_food():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    user = UserModel.get_by_id(user_id)
    if not user.get('is_verified'):
        return jsonify({"success": False, "error": "Your NGO account is pending admin verification"}), 403

    data = request.get_json() or {}
    food_id = data.get('food_id')
    quantity = int(data.get('quantity', 1))
    notes = data.get('notes', '')
    beneficiaries = int(data.get('beneficiaries_fed', 0))

    donation_id, err = DonationModel.create_donation(food_id, user_id, quantity, notes, beneficiaries)
    if err:
        return jsonify({"success": False, "error": err}), 400

    return jsonify({"success": True, "message": "Surplus food redistribution request submitted", "donation_id": donation_id}), 201

@ngo_bp.route('/my-donations', methods=['GET'])
def get_ngo_donations():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    donations = DonationModel.get_by_ngo(user_id)
    return jsonify({"success": True, "donations": donations})

@ngo_bp.route('/donations/<int:donation_id>/status', methods=['PUT'])
def update_donation_status(donation_id):
    data = request.get_json() or {}
    status = data.get('status')
    beneficiaries = data.get('beneficiaries_fed')
    ok = DonationModel.update_status(donation_id, status, beneficiaries)
    return jsonify({"success": ok, "message": f"Donation status updated to {status}"})
