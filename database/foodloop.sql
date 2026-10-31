-- ========================================================
-- FOODLOOP: SMART COLLEGE FOOD WASTE MANAGEMENT APPLICATION
-- Database: foodloop_db
-- Target: MySQL 8.0+
-- ========================================================

CREATE DATABASE IF NOT EXISTS foodloop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE foodloop_db;

-- --------------------------------------------------------
-- 1. Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'canteen', 'hostel', 'ngo', 'admin') NOT NULL DEFAULT 'student',
    phone VARCHAR(20) NOT NULL,
    organization_name VARCHAR(150) NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 2. Table structure for table `food_items`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_items (
    food_id INT AUTO_INCREMENT PRIMARY KEY,
    food_name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    category ENUM('Meals', 'Breakfast', 'Snacks', 'Beverages', 'Bakery', 'Fresh Fruits') NOT NULL DEFAULT 'Meals',
    quantity INT NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(30) NOT NULL DEFAULT 'servings',
    image_url TEXT NULL,
    pickup_location VARCHAR(200) NOT NULL,
    prepared_at DATETIME NOT NULL,
    expiry_time DATETIME NOT NULL,
    allergen_info VARCHAR(255) DEFAULT 'None',
    food_type ENUM('Vegetarian', 'Non-Vegetarian', 'Vegan') NOT NULL DEFAULT 'Vegetarian',
    status ENUM('available', 'reserved', 'collected', 'expired') NOT NULL DEFAULT 'available',
    uploaded_by INT NOT NULL,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 3. Table structure for table `reservations`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    reservation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_status ENUM('reserved', 'collected', 'cancelled') NOT NULL DEFAULT 'reserved',
    verification_code VARCHAR(10) NOT NULL,
    collected_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_items(food_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 4. Table structure for table `waste_reports`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS waste_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    food_name VARCHAR(150) NOT NULL,
    quantity DECIMAL(8,2) NOT NULL CHECK (quantity >= 0),
    quantity_prepared DECIMAL(8,2) DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    meal_type ENUM('Breakfast', 'Lunch', 'Snacks', 'Dinner') NOT NULL,
    location VARCHAR(150) NOT NULL,
    waste_reason VARCHAR(255) NOT NULL,
    image_url TEXT NULL,
    report_date DATE NOT NULL,
    reported_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 5. Table structure for table `donations`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS donations (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    food_id INT NOT NULL,
    ngo_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    collection_status ENUM('requested', 'in_transit', 'collected', 'distributed') NOT NULL DEFAULT 'requested',
    beneficiaries_fed INT DEFAULT 0,
    donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    FOREIGN KEY (food_id) REFERENCES food_items(food_id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 6. Table structure for table `notifications`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Sample Demonstration Seed Data
-- --------------------------------------------------------

-- Default test users with hashed passwords
INSERT INTO users (user_id, name, email, password, role, phone, organization_name, is_verified) VALUES
(1, 'Aarav Sharma', 'student@college.edu', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'student', '+91 98765 43210', 'B.Tech Computer Science - Year 3', TRUE),
(2, 'Chef Sundaram Pillai', 'canteen@college.edu', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'canteen', '+91 98450 11223', 'Central Campus Food Court', TRUE),
(3, 'Warden Rajesh Nair', 'hostel@college.edu', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'hostel', '+91 98452 99881', 'Hostel Block-C Dining Mess', TRUE),
(4, 'Priya Menon', 'ngo@robinhoodarmy.org', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'ngo', '+91 97401 55443', 'Robin Hood Army & Annakshetra NGO', TRUE),
(5, 'Dr. Meenakshi Raman', 'admin@college.edu', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'admin', '+91 99000 12345', 'Dean of Campus Sustainability & Administration', TRUE);

-- Required 7 Sample Demonstration Food Listings
INSERT INTO food_items (food_id, food_name, description, category, quantity, unit, image_url, pickup_location, prepared_at, expiry_time, allergen_info, food_type, status, uploaded_by, is_demo) VALUES
(1, 'Vegetable Rice', 'Freshly steamed aromatic spiced rice tempered with seasonal veggies, curry leaves, and toasted cashews.', 'Meals', 24, 'servings', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80', 'Canteen Counter 1 - Hot Plate Bar', NOW(), DATE_ADD(NOW(), INTERVAL 4 HOUR), 'Contains Cashews', 'Vegetarian', 'available', 2, TRUE),
(2, 'Idli and Sambar', 'Soft, fluffy steamed fermented rice cakes served with hot lentil vegetable stew and freshly ground coconut chutney.', 'Breakfast', 30, 'servings', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', 'Hostel Block A Mess - Breakfast Pantry', NOW(), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'Coconut, Mustard Seeds', 'Vegetarian', 'available', 3, TRUE),
(3, 'Chapati and Vegetable Kurma', 'Whole wheat hand-rolled chapatis served with rich coconut-poppy seed vegetable kurma with carrots and peas.', 'Meals', 18, 'servings', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80', 'Main Canteen - Counter 3', NOW(), DATE_ADD(NOW(), INTERVAL 5 HOUR), 'Contains Wheat Gluten', 'Vegetarian', 'available', 2, TRUE),
(4, 'Lemon Rice', 'Tangy South Indian chitranna spiced with turmeric, mustard seeds, green chillies, ginger, and roasted peanuts.', 'Meals', 15, 'servings', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80', 'North Canteen Annexe - Pick-up Point', NOW(), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'Contains Peanuts', 'Vegan', 'available', 2, TRUE),
(5, 'Vegetable Biryani', 'Slow-cooked dum biryani with long-grain basmati, mint, saffron, and fresh country vegetables. Packed hygienically.', 'Meals', 22, 'servings', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 'Hostel Block C Kitchen Door', NOW(), DATE_ADD(NOW(), INTERVAL 6 HOUR), 'Dairy (Ghee)', 'Vegetarian', 'available', 3, TRUE),
(6, 'Fresh Fruit Boxes', 'Pre-cut sealed fruit boxes featuring seasonal watermelons, papayas, pineapple, and grapes.', 'Fresh Fruits', 28, 'boxes', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80', 'Juice & Salad Kiosk - Central Lawn', NOW(), DATE_ADD(NOW(), INTERVAL 5 HOUR), 'None', 'Vegan', 'available', 2, TRUE),
(7, 'Bread and Sandwiches', 'Freshly toasted vegetable mayonnaise and grilled tomato-cucumber clubhouse sandwiches.', 'Snacks', 14, 'servings', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80', 'Campus Bakery & Cafe Lounge', NOW(), DATE_ADD(NOW(), INTERVAL 4 HOUR), 'Gluten, Dairy', 'Vegetarian', 'available', 2, TRUE);

-- Sample reservations
INSERT INTO reservations (reservation_id, user_id, food_id, quantity, reservation_time, pickup_status, verification_code) VALUES
(1, 1, 1, 2, DATE_SUB(NOW(), INTERVAL 1 HOUR), 'reserved', 'FL-8492');

-- Sample waste reports
INSERT INTO waste_reports (report_id, food_name, quantity, quantity_prepared, unit, meal_type, location, waste_reason, report_date, reported_by) VALUES
(1, 'Rice & Sambhar Leftover', 12.5, 80.0, 'kg', 'Lunch', 'Hostel Block A Mess', 'Low student turnout due to campus festival', CURDATE(), 3),
(2, 'Curd Rice & Gravy', 8.0, 65.0, 'kg', 'Dinner', 'Hostel Block B Mess', 'Excess preparation estimation', CURDATE(), 3),
(3, 'Breakfast Poha & Upma', 5.5, 45.0, 'kg', 'Breakfast', 'Central Canteen', 'Over-preparation on rainy morning', CURDATE(), 2);

-- Sample donations
INSERT INTO donations (donation_id, food_id, ngo_id, quantity, collection_status, beneficiaries_fed, donation_date, notes) VALUES
(1, 5, 4, 15, 'collected', 30, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Successfully redistributed to Little Drops Elder Care home');

-- Sample notifications
INSERT INTO notifications (notification_id, user_id, title, message, type, is_read) VALUES
(1, 1, 'Welcome to FOODLOOP!', 'You can now browse surplus canteen food and reserve servings for free or subsidized pickup.', 'new_food', FALSE),
(2, 1, 'Reservation Confirmed: Vegetable Rice', 'Your reservation #FL-8492 for 2 servings has been held at Canteen Counter 1. Pickup before expiry!', 'reservation_confirmed', FALSE),
(3, 2, 'New Reservation Received', 'Student Aarav Sharma reserved 2 servings of Vegetable Rice.', 'alert', TRUE);
