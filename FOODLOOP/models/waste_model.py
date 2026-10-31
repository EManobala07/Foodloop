from models.db import get_db_connection

class WasteModel:
    @staticmethod
    def create_report(food_name, quantity, quantity_prepared, unit, meal_type, location, waste_reason, image_url, report_date, reported_by):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO waste_reports (food_name, quantity, quantity_prepared, unit, meal_type, location, waste_reason, image_url, report_date, reported_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (food_name, quantity, quantity_prepared, unit, meal_type, location, waste_reason, image_url, report_date, reported_by))
                return cursor.lastrowid
        finally:
            conn.close()

    @staticmethod
    def get_all_reports(location=None, meal_type=None):
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    SELECT w.*, u.name as reported_by_name, u.role as reporter_role
                    FROM waste_reports w
                    JOIN users u ON w.reported_by = u.user_id
                    WHERE 1=1
                """
                params = []
                if location:
                    query += " AND w.location LIKE %s"
                    params.append(f"%{location}%")
                if meal_type and meal_type != 'All':
                    query += " AND w.meal_type = %s"
                    params.append(meal_type)
                query += " ORDER BY w.report_date DESC, w.created_at DESC"
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def get_stats():
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                # Waste stats
                cursor.execute("""
                    SELECT 
                        COALESCE(SUM(quantity), 0) as total_wasted,
                        COALESCE(SUM(quantity_prepared), 0) as total_prepared
                    FROM waste_reports
                """)
                stats = cursor.fetchone()

                # Breakdown by meal
                cursor.execute("""
                    SELECT meal_type, SUM(quantity) as wasted_kg, COUNT(*) as report_count
                    FROM waste_reports
                    GROUP BY meal_type
                """)
                meal_stats = cursor.fetchall()

                # Food saved via reservations and donations
                cursor.execute("SELECT COALESCE(SUM(quantity), 0) as reserved_servings FROM reservations WHERE pickup_status IN ('reserved', 'collected')")
                res = cursor.fetchone()

                cursor.execute("SELECT COALESCE(SUM(quantity), 0) as donated_servings FROM donations")
                don = cursor.fetchone()

                total_wasted = float(stats['total_wasted'])
                total_prepared = float(stats['total_prepared']) if float(stats['total_prepared']) > 0 else (total_wasted + 150.0)
                waste_pct = round((total_wasted / total_prepared) * 100, 1) if total_prepared > 0 else 0.0

                return {
                    "total_wasted_kg": total_wasted,
                    "total_prepared_kg": total_prepared,
                    "waste_percentage": waste_pct,
                    "meal_breakdown": meal_stats,
                    "total_saved_servings": int(res['reserved_servings']) + int(don['donated_servings'])
                }
        finally:
            conn.close()
