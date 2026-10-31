from models.db import get_db_connection

class FoodModel:
    @staticmethod
    def get_available_food(category=None, food_type=None, search=None):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    SELECT f.*, u.name as canteen_name, u.phone as canteen_phone
                    FROM food_items f
                    JOIN users u ON f.uploaded_by = u.user_id
                    WHERE f.status = 'available' AND f.quantity > 0 AND f.expiry_time > NOW()
                """
                params = []
                if category and category != 'All':
                    query += " AND f.category = %s"
                    params.append(category)
                if food_type and food_type != 'All':
                    query += " AND f.food_type = %s"
                    params.append(food_type)
                if search:
                    query += " AND (f.food_name LIKE %s OR f.description LIKE %s OR f.pickup_location LIKE %s)"
                    params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
                query += " ORDER BY f.expiry_time ASC"
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def get_by_id(food_id):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM food_items WHERE food_id = %s", (food_id,))
                return cursor.fetchone()
        finally:
            conn.close()

    @staticmethod
    def create_food_item(name, description, category, quantity, unit, image_url, pickup_location, prepared_at, expiry_time, allergen_info, food_type, uploaded_by):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO food_items (food_name, description, category, quantity, unit, image_url, pickup_location, prepared_at, expiry_time, allergen_info, food_type, status, uploaded_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'available', %s)
                """
                cursor.execute(sql, (name, description, category, quantity, unit, image_url, pickup_location, prepared_at, expiry_time, allergen_info, food_type, uploaded_by))
                return cursor.lastrowid
        finally:
            conn.close()

    @staticmethod
    def update_quantity(food_id, delta):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE food_items 
                    SET quantity = quantity + %s,
                        status = CASE WHEN quantity + %s <= 0 THEN 'reserved' ELSE 'available' END
                    WHERE food_id = %s AND (quantity + %s >= 0)
                """, (delta, delta, food_id, delta))
                return cursor.rowcount > 0
        finally:
            conn.close()

    @staticmethod
    def update_status(food_id, status):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("UPDATE food_items SET status = %s WHERE food_id = %s", (status, food_id))
                return cursor.rowcount > 0
        finally:
            conn.close()

    @staticmethod
    def get_by_canteen(canteen_id):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM food_items WHERE uploaded_by = %s ORDER BY created_at DESC", (canteen_id,))
                return cursor.fetchall()
        finally:
            conn.close()
