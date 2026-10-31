from models.db import get_db_connection

class DonationModel:
    @staticmethod
    def create_donation(food_id, ngo_id, quantity, notes=None, beneficiaries_fed=0):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                # Stock deduction check
                cursor.execute("SELECT quantity, status FROM food_items WHERE food_id = %s FOR UPDATE", (food_id,))
                food = cursor.fetchone()
                if not food or food['quantity'] < quantity:
                    return None, "Insufficient stock for donation request"

                new_qty = food['quantity'] - quantity
                new_status = 'reserved' if new_qty == 0 else 'available'
                cursor.execute("UPDATE food_items SET quantity = %s, status = %s WHERE food_id = %s", (new_qty, new_status, food_id))

                sql = """
                    INSERT INTO donations (food_id, ngo_id, quantity, collection_status, beneficiaries_fed, notes)
                    VALUES (%s, %s, %s, 'requested', %s, %s)
                """
                cursor.execute(sql, (food_id, ngo_id, quantity, beneficiaries_fed, notes))
                return cursor.lastrowid, None
        finally:
            conn.close()

    @staticmethod
    def get_by_ngo(ngo_id):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                sql = """
                    SELECT d.*, f.food_name, f.pickup_location, f.unit, f.image_url, u.name as canteen_name, u.phone as canteen_phone
                    FROM donations d
                    JOIN food_items f ON d.food_id = f.food_id
                    JOIN users u ON f.uploaded_by = u.user_id
                    WHERE d.ngo_id = %s
                    ORDER BY d.donation_date DESC
                """
                cursor.execute(sql, (ngo_id,))
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def update_status(donation_id, status, beneficiaries_fed=None):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                if beneficiaries_fed is not None:
                    cursor.execute("UPDATE donations SET collection_status = %s, beneficiaries_fed = %s WHERE donation_id = %s", (status, beneficiaries_fed, donation_id))
                else:
                    cursor.execute("UPDATE donations SET collection_status = %s WHERE donation_id = %s", (status, donation_id))
                return cursor.rowcount > 0
        finally:
            conn.close()
