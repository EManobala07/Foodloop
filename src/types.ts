export type UserRole = 'student' | 'canteen' | 'hostel' | 'ngo' | 'admin';

export interface User {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  organization_name?: string;
  is_verified: boolean;
  created_at: string;
}

export type FoodCategory = 'Meals' | 'Breakfast' | 'Snacks' | 'Beverages' | 'Bakery' | 'Fresh Fruits';
export type FoodType = 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';
export type FoodStatus = 'available' | 'reserved' | 'collected' | 'expired';

export interface FoodItem {
  food_id: number;
  food_name: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  image_url: string;
  pickup_location: string;
  prepared_at: string;
  expiry_time: string;
  allergen_info: string;
  food_type: FoodType;
  status: FoodStatus;
  uploaded_by: number;
  uploader_name?: string;
  uploader_phone?: string;
  is_demo?: boolean;
  created_at: string;
}

export interface Reservation {
  reservation_id: number;
  user_id: number;
  food_id: number;
  quantity: number;
  reservation_time: string;
  pickup_status: 'reserved' | 'collected' | 'cancelled';
  verification_code: string;
  collected_at?: string;
  food_name?: string;
  food_image?: string;
  pickup_location?: string;
  expiry_time?: string;
  unit?: string;
  student_name?: string;
  student_phone?: string;
  student_email?: string;
  canteen_name?: string;
}

export interface WasteReport {
  report_id: number;
  food_name: string;
  quantity: number;
  quantity_prepared: number;
  unit: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  location: string;
  waste_reason: string;
  image_url?: string;
  report_date: string;
  reported_by: number;
  reporter_name?: string;
  reporter_role?: string;
  created_at: string;
}

export interface Donation {
  donation_id: number;
  food_id: number;
  ngo_id: number;
  quantity: number;
  collection_status: 'requested' | 'in_transit' | 'collected' | 'distributed';
  beneficiaries_fed: number;
  donation_date: string;
  notes?: string;
  food_name?: string;
  food_image?: string;
  pickup_location?: string;
  unit?: string;
  ngo_name?: string;
  canteen_name?: string;
}

export interface NotificationItem {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'new_food' | 'reservation_confirmed' | 'reservation_cancelled' | 'pickup_reminder' | 'food_expired' | 'ngo_collection' | 'alert';
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_students: number;
  total_canteens: number;
  total_hostels: number;
  active_ngos: number;
  total_food_listings: number;
  active_food_listings: number;
  total_food_requests: number;
  total_food_wasted_kg: number;
  total_food_prepared_kg: number;
  waste_percentage: number;
  total_food_saved_kg: number;
  total_portions_saved: number;
  co2_saved_kg: number;
  meal_breakdown: Record<string, number>;
  weekly_trends: { day: string; prepared: number; wasted: number; saved: number }[];
}
