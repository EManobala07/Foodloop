import random
import string
from models.db import get_db_connection

class ReservationModel:
    @staticmethod
    def generate_code():
        chars = ''.join(random.choices(string.digits, k=4))
        return f"FL-{chars}"

    @staticmethod
    def create_reservation(user_id, food_id, quantity):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                # 1. Check stock
                cursor.execute("SELECT quantity, status, expiry_time FROM food_items WHERE food_id = %s FOR UPDATE", (food_id,))
                food = cursor.fetchone()
                if not food:
                    return None, "Food item not found"
                if food['status'] != 'available':
                    return None, "Item is no longer available"
                if food['quantity'] < quantity:
                    return None, f"Only {food['quantity']} portions available"
                
                # 2. Decrement quantity
                new_qty = food['quantity'] - quantity
                new_status = 'reserved' if new_qty == 0 else 'available'
                cursor.execute("UPDATE food_items SET quantity = %s, status = %s WHERE food_id = %s", (new_qty, new_status, food_id))

                # 3. Insert reservation
                code = ReservationModel.generate_code()
                sql = """
                    INSERT INTO reservations (user_id, food_id, quantity, pickup_status, verification_code)
                    VALUES (%s, %s, %s, 'reserved', %s)
                """
                cursor.execute(sql, (user_id, food_id, quantity, code))
                res_id = cursor.lastrowid
                return {"reservation_id": res_id, "verification_code": code}, None
        finally:
            conn.close()

    @staticmethod
    def get_by_user(user_id):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                sql = """
                    SELECT r.*, f.food_name, f.pickup_location, f.image_url, f.expiry_time, f.unit, u.name as canteen_name, u.phone as canteen_phone
                    FROM reservations r
                    JOIN food_items f ON r.food_id = f.food_id
                    JOIN users u ON f.uploaded_by = u.user_id
                    WHERE r.user_id = %s
                    ORDER BY r.reservation_time DESC
                """
                cursor.execute(sql, (user_id,))
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def get_by_canteen(canteen_id):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                sql = """
                    SELECT r.*, f.food_name, f.unit, u.name as student_name, u.phone as student_phone, u.email as student_email
                    FROM reservations r
                    JOIN food_items f ON r.food_id = f.food_id
                    JOIN users u ON r.user_id = u.user_id
                    WHERE f.uploaded_by = %s
                    ORDER BY r.reservation_time DESC
                """
                cursor.execute(sql, (canteen_id,))
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def cancel_reservation(reservation_id, user_id):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM reservations WHERE reservation_id = %s AND user_id = %s", (reservation_id, user_id))
                res = cursor.fetchone()
                if not res:
                    return False, "Reservation not found"
                if res['pickup_status'] != 'reserved':
                    return False, f"Cannot cancel reservation with status '{res['pickup_status']}'"

                # Restore quantity
                cursor.execute("UPDATE food_items SET quantity = quantity + %s, status = 'available' WHERE food_id = %s", (res['quantity'], res['food_id']))
                # Mark cancelled
                cursor.execute("UPDATE reservations SET pickup_status = 'cancelled' WHERE reservation_id = %s", (reservation_id,))
                return True, "Reservation successfully cancelled"
        finally:
            conn.close()

    @staticmethod
    def mark_collected(reservation_id, verification_code=None):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                query = "SELECT * FROM reservations WHERE reservation_id = %s"
                params = [reservation_id]
                if verification_code:
                    query += " AND verification_code = %s"
                    params.append(verification_code)
                cursor.execute(query, tuple(params))
                res = cursor.fetchone()
                if not res:
                    return False, "Invalid reservation ID or verification code"
                if res['pickup_status'] == 'collected':
                    return False, "Already marked as collected"

                cursor.execute("UPDATE reservations SET pickup_status = 'collected', collected_at = NOW() WHERE reservation_id = %s", (reservation_id,))
                return True, "Food marked as collected"
        finally:
            conn.close()
