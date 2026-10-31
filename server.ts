import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, hashPassword, User } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Simple authorization token extraction (Supports Bearer token or x-user-id for simplicity)
function getAuthenticatedUser(req: Request): User | null {
  const userIdHeader = req.headers['x-user-id'];
  if (userIdHeader) {
    const id = parseInt(userIdHeader as string, 10);
    const user = db.getUserById(id);
    if (user) return user;
  }
  // Default to student 1 if not provided (ensures smooth demo usability)
  return db.getUserById(1) || null;
}

// -------------------------------------------------------------
// 1. AUTH & USER ROUTES
// -------------------------------------------------------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, organization_name } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const validRoles = ['student', 'canteen', 'hostel', 'ngo', 'admin'];
    const assignedRole = validRoles.includes(role) ? role : 'student';

    const newUser = db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password_hash: hashPassword(password),
      role: assignedRole,
      phone: phone.trim(),
      organization_name: organization_name ? organization_name.trim() : undefined,
      is_verified: assignedRole === 'ngo' ? false : true // NGOs require admin verification
    });

    const { password_hash, ...safeUser } = newUser;
    return res.status(201).json({ success: true, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const hash = hashPassword(password);
    if (user.password_hash !== hash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const { password_hash, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ authenticated: false });
  const { password_hash, ...safeUser } = user;
  return res.json({ authenticated: true, user: safeUser });
});

// One-click quick demo switcher to test any role instantly
app.get('/api/auth/quick-switch/:role', (req: Request, res: Response) => {
  const role = req.params.role;
  const users = db.getUsers();
  const matched = users.find(u => u.role === role);
  if (matched) {
    const { password_hash, ...safeUser } = matched;
    return res.json({ success: true, user: safeUser });
  }
  return res.status(404).json({ success: false, error: 'Role not found' });
});

// -------------------------------------------------------------
// 2. FOOD ITEMS (SURPLUS LISTINGS)
// -------------------------------------------------------------

app.get('/api/food', (req: Request, res: Response) => {
  const { category, food_type, status, search } = req.query;
  const items = db.getFoodItems({
    category: category as string,
    food_type: food_type as string,
    status: (status as string) || 'available',
    search: search as string
  });
  return res.json({ success: true, items });
});

app.post('/api/food', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || (user.role !== 'canteen' && user.role !== 'hostel' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Only canteen and hostel staff can upload surplus food.' });
    }

    const {
      food_name,
      description,
      category,
      quantity,
      unit,
      image_url,
      pickup_location,
      prepared_at,
      expiry_time,
      allergen_info,
      food_type
    } = req.body;

    if (!food_name || !pickup_location || !expiry_time) {
      return res.status(400).json({ success: false, error: 'Food name, pickup location, and expiry time are required.' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Quantity must be a positive number.' });
    }

    const defaultImages: Record<string, string> = {
      Meals: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      Breakfast: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      Snacks: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
      'Fresh Fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
      Bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
      Beverages: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80'
    };

    const item = db.createFoodItem({
      food_name: food_name.trim(),
      description: description ? description.trim() : 'Fresh surplus meal prepared with hygienic standards.',
      category: category || 'Meals',
      quantity: qty,
      unit: unit || 'servings',
      image_url: image_url && image_url.trim().length > 5 ? image_url.trim() : defaultImages[category] || defaultImages.Meals,
      pickup_location: pickup_location.trim(),
      prepared_at: prepared_at || new Date().toISOString(),
      expiry_time: new Date(expiry_time).toISOString(),
      allergen_info: allergen_info ? allergen_info.trim() : 'None declared',
      food_type: food_type || 'Vegetarian',
      uploaded_by: user.user_id,
      is_demo: false
    });

    return res.status(201).json({ success: true, item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/food/:id/status', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!['available', 'reserved', 'collected', 'expired'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  const ok = db.updateFoodStatus(id, status);
  return res.json({ success: ok });
});

// -------------------------------------------------------------
// 3. RESERVATIONS
// -------------------------------------------------------------

app.post('/api/reservations', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Please sign in to reserve food.' });
    }

    const { food_id, quantity } = req.body;
    const foodId = parseInt(food_id, 10);
    const qty = parseInt(quantity, 10) || 1;

    const result = db.createReservation(user.user_id, foodId, qty);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    return res.status(201).json({
      success: true,
      reservation: result.reservation,
      message: `Reservation confirmed! Present code ${result.reservation?.verification_code} at pickup counter.`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/reservations', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  if (user.role === 'canteen' || user.role === 'hostel') {
    const reservations = db.getReservations({ canteenId: user.user_id });
    return res.json({ success: true, reservations });
  } else if (user.role === 'admin') {
    const reservations = db.getReservations();
    return res.json({ success: true, reservations });
  } else {
    const reservations = db.getReservations({ userId: user.user_id });
    return res.json({ success: true, reservations });
  }
});

app.post('/api/reservations/:id/cancel', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const id = parseInt(req.params.id, 10);
  const result = db.cancelReservation(id, user.user_id);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }
  return res.json({ success: true, message: 'Reservation cancelled. Servings returned to available stock.' });
});

app.post('/api/reservations/:id/verify-pickup', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { code } = req.body;
  const result = db.verifyPickup(id, code);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }
  return res.json({ success: true, message: 'Pickup verified! Handover completed.' });
});

// -------------------------------------------------------------
// 4. HOSTEL & CANTEEN WASTE REPORTING
// -------------------------------------------------------------

app.get('/api/waste-reports', (req: Request, res: Response) => {
  const { location, meal_type } = req.query;
  const reports = db.getWasteReports({
    location: location as string,
    meal_type: meal_type as string
  });
  return res.json({ success: true, reports });
});

app.post('/api/waste-reports', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { food_name, quantity, quantity_prepared, unit, meal_type, location, waste_reason, image_url, report_date } = req.body;

    if (!food_name || quantity === undefined || !meal_type || !location || !waste_reason) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const qty = parseFloat(quantity);
    const qtyPrep = parseFloat(quantity_prepared) || (qty * 3.5);

    const report = db.createWasteReport({
      food_name: food_name.trim(),
      quantity: Math.max(0, qty),
      quantity_prepared: Math.max(0, qtyPrep),
      unit: unit || 'kg',
      meal_type: meal_type,
      location: location.trim(),
      waste_reason: waste_reason.trim(),
      image_url: image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      report_date: report_date || new Date().toISOString().split('T')[0],
      reported_by: user ? user.user_id : 3
    });

    return res.status(201).json({ success: true, report, message: 'Waste report logged successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 5. NGO & VOLUNTEER MODULE
// -------------------------------------------------------------

app.get('/api/donations', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const ngoId = user && user.role === 'ngo' ? user.user_id : undefined;
  const donations = db.getDonations(ngoId);
  return res.json({ success: true, donations });
});

app.post('/api/donations', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'ngo') {
      return res.status(403).json({ success: false, error: 'Only verified NGO volunteers can claim redistribution batches.' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ success: false, error: 'Your NGO account is pending administrative verification.' });
    }

    const { food_id, quantity, notes, beneficiaries_fed } = req.body;
    const foodId = parseInt(food_id, 10);
    const qty = parseInt(quantity, 10) || 1;
    const beneficiaries = parseInt(beneficiaries_fed, 10) || (qty * 2);

    const result = db.createDonation({
      food_id: foodId,
      ngo_id: user.user_id,
      quantity: qty,
      beneficiaries_fed: beneficiaries,
      notes: notes ? notes.trim() : 'Scheduled for local community food bank'
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    return res.status(201).json({ success: true, donation: result.donation, message: 'Surplus food request confirmed. Pickup counter alerted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/donations/:id/status', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status, beneficiaries_fed } = req.body;
  const ok = db.updateDonationStatus(id, status, beneficiaries_fed ? parseInt(beneficiaries_fed, 10) : undefined);
  return res.json({ success: ok });
});

// -------------------------------------------------------------
// 6. NOTIFICATIONS
// -------------------------------------------------------------

app.get('/api/notifications', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const notifs = db.getNotifications(user.user_id);
  return res.json({ success: true, notifications: notifs });
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const id = parseInt(req.params.id, 10);
  const ok = db.markNotificationAsRead(id, user.user_id);
  return res.json({ success: ok });
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  db.markAllNotificationsAsRead(user.user_id);
  return res.json({ success: true });
});

// -------------------------------------------------------------
// 7. STATS & ANALYTICS
// -------------------------------------------------------------

app.get('/api/stats/dashboard', (_req: Request, res: Response) => {
  const stats = db.getOverallStats();
  return res.json({ success: true, stats });
});

// -------------------------------------------------------------
// 8. ADMIN OPERATIONS
// -------------------------------------------------------------

app.get('/api/admin/users', (_req: Request, res: Response) => {
  const users = db.getUsers().map(u => {
    const { password_hash, ...safe } = u;
    return safe;
  });
  return res.json({ success: true, users });
});

app.put('/api/admin/users/:id/verify', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { is_verified } = req.body;
  const ok = db.updateUserVerification(id, Boolean(is_verified));
  return res.json({ success: ok, message: 'User verification status updated.' });
});

// Export CSV report of waste and surplus saved
app.get('/api/admin/reports/export', (_req: Request, res: Response) => {
  const stats = db.getOverallStats();
  const reports = db.getWasteReports();

  let csv = 'Report ID,Date,Meal Type,Location,Food Item,Quantity Wasted (kg),Quantity Prepared (kg),Waste Reason,Reported By\n';
  for (const r of reports) {
    csv += `"${r.report_id}","${r.report_date}","${r.meal_type}","${r.location}","${r.food_name}","${r.quantity}","${r.quantity_prepared}","${r.waste_reason}","${r.reporter_name}"\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="foodloop_waste_report.csv"');
  return res.send(csv);
});

// Reset demo data endpoint
app.post('/api/system/reset-demo', (_req: Request, res: Response) => {
  db.resetToSample();
  return res.json({ success: true, message: 'Demo data reloaded to fresh initial state.' });
});

// -------------------------------------------------------------
// 9. VITE MIDDLEWARE & STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌱 FOODLOOP full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
