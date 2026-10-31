from flask import Blueprint, request, jsonify, session
from models.waste_model import WasteModel

hostel_bp = Blueprint('hostel', __name__)

@hostel_bp.route('/waste-log', methods=['POST'])
def log_hostel_waste():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    data = request.get_json() or {}
    report_id = WasteModel.create_report(
        food_name=data.get('food_name'),
        quantity=float(data.get('quantity', 0)),
        quantity_prepared=float(data.get('quantity_prepared', 0)),
        unit=data.get('unit', 'kg'),
        meal_type=data.get('meal_type', 'Dinner'),
        location=data.get('location', 'Hostel Mess'),
        waste_reason=data.get('waste_reason', 'Leftover after meal hours'),
        image_url=data.get('image_url'),
        report_date=data.get('report_date'),
        reported_by=user_id
    )
    return jsonify({"success": True, "message": "Hostel waste record logged successfully", "report_id": report_id}), 201

@hostel_bp.route('/waste-reports', methods=['GET'])
def get_hostel_reports():
    location = request.args.get('location')
    meal_type = request.args.get('meal_type')
    reports = WasteModel.get_all_reports(location=location, meal_type=meal_type)
    return jsonify({"success": True, "reports": reports})

@hostel_bp.route('/stats', methods=['GET'])
def get_hostel_stats():
    stats = WasteModel.get_stats()
    return jsonify({"success": True, "stats": stats})
