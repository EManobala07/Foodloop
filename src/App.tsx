import React, { useState, useEffect } from 'react';
import { 
  User, UserRole, FoodItem, Reservation, WasteReport, 
  Donation, NotificationItem, DashboardStats 
} from './types';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { CanteenDashboard } from './components/CanteenDashboard';
import { HostelDashboard } from './components/HostelDashboard';
import { NgoDashboard } from './components/NgoDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { Leaf, Heart, Database, Code2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [wasteReports, setWasteReports] = useState<WasteReport[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 1,
    total_canteens: 1,
    total_hostels: 1,
    active_ngos: 1,
    total_food_listings: 7,
    active_food_listings: 7,
    total_food_requests: 1,
    total_food_wasted_kg: 34.5,
    total_food_prepared_kg: 273.0,
    waste_percentage: 12.6,
    total_food_saved_kg: 18.0,
    total_portions_saved: 45,
    co2_saved_kg: 45.0,
    meal_breakdown: { Breakfast: 6.2, Lunch: 14.5, Snacks: 4.0, Dinner: 9.8 },
    weekly_trends: []
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper headers for user role context
  const getHeaders = () => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (currentUser?.user_id) {
      h['x-user-id'] = currentUser.user_id.toString();
    }
    return h;
  };

  // Fetch initial state & stats
  const fetchAllData = async (userObj?: User | null) => {
    const u = userObj !== undefined ? userObj : currentUser;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (u?.user_id) {
      headers['x-user-id'] = u.user_id.toString();
    }

    try {
      // 1. Food Items
      const foodRes = await fetch('/api/food?status=available');
      if (foodRes.ok) {
        const data = await foodRes.json();
        setFoodItems(data.items || []);
      }

      // 2. Reservations
      const resRes = await fetch('/api/reservations', { headers });
      if (resRes.ok) {
        const data = await resRes.json();
        setReservations(data.reservations || []);
      }

      // 3. Waste Reports
      const wasteRes = await fetch('/api/waste-reports');
      if (wasteRes.ok) {
        const data = await wasteRes.json();
        setWasteReports(data.reports || []);
      }

      // 4. Donations
      const donRes = await fetch('/api/donations', { headers });
      if (donRes.ok) {
        const data = await donRes.json();
        setDonations(data.donations || []);
      }

      // 5. Notifications
      const notifRes = await fetch('/api/notifications', { headers });
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.notifications || []);
      }

      // 6. Overall Stats
      const statRes = await fetch('/api/stats/dashboard');
      if (statRes.ok) {
        const data = await statRes.json();
        setStats(data.stats);
      }

      // 7. Users (for admin)
      const userRes = await fetch('/api/admin/users');
      if (userRes.ok) {
        const data = await userRes.json();
        setAllUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch: bootstrap default student Aarav Sharma
    fetch('/api/auth/quick-switch/student')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          fetchAllData(data.user);
        } else {
          fetchAllData(null);
        }
      })
      .catch(() => {
        fetchAllData(null);
      });
  }, []);

  // Quick switch role handler
  const handleSwitchRole = async (role: UserRole) => {
    try {
      const res = await fetch(`/api/auth/quick-switch/${role}`);
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        await fetchAllData(data.user);
        showToast(`Switched active view to: ${data.user.role.toUpperCase()} (${data.user.name})`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auth: Login
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        await fetchAllData(data.user);
        showToast(`Welcome back, ${data.user.name}!`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Auth: Register
  const handleRegister = async (data: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        setCurrentUser(resData.user);
        await fetchAllData(resData.user);
        showToast(`Account created! Welcome, ${resData.user.name}.`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Student: Reserve Food
  const handleReserve = async (foodId: number, quantity: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ food_id: foodId, quantity })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Reservation confirmed!');
        await fetchAllData();
        return true;
      } else {
        alert(data.error || 'Failed to make reservation');
        return false;
      }
    } catch {
      return false;
    }
  };

  // Student: Cancel Reservation
  const handleCancelReservation = async (reservationId: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast('Reservation cancelled. Servings returned to available stock.');
        await fetchAllData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Canteen: Add Surplus Food
  const handleAddFood = async (foodData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/food', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(foodData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Surplus food listing published to campus feed!');
        await fetchAllData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Canteen: Verify Pickup Handover
  const handleVerifyPickup = async (reservationId: number, code?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/reservations/${reservationId}/verify-pickup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Pickup verified! Food marked as handed over.');
        await fetchAllData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Canteen: Update Food Status
  const handleUpdateFoodStatus = async (foodId: number, status: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/food/${foodId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status updated to ${status}`);
        await fetchAllData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Hostel / Student: Log Waste Report
  const handleLogWaste = async (wasteData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/waste-reports', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(wasteData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Waste report logged in campus audit records!');
        await fetchAllData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // NGO: Claim Redistribution Batch
  const handleRequestDonation = async (foodId: number, quantity: number, notes: string, beneficiaries: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ food_id: foodId, quantity, notes, beneficiaries_fed: beneficiaries })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Surplus food claimed for community redistribution!');
        await fetchAllData();
        return true;
      } else {
        alert(data.error || 'Failed to submit redistribution request');
        return false;
      }
    } catch {
      return false;
    }
  };

  // NGO: Update Status
  const handleUpdateDonationStatus = async (donationId: number, status: Donation['collection_status'], beneficiaries?: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/donations/${donationId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, beneficiaries_fed: beneficiaries })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Redistribution status updated to: ${status.replace('_', ' ')}`);
        await fetchAllData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Admin: Verify User
  const handleVerifyUser = async (userId: number, isVerified: boolean): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ is_verified: isVerified })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`User verification status updated.`);
        await fetchAllData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Admin: Export CSV
  const handleExportCSV = () => {
    window.location.href = '/api/admin/reports/export';
  };

  // Reset Demo
  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/system/reset-demo', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Sample demonstration data reloaded to initial state.');
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Notification: Mark Read
  const handleMarkNotificationAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT', headers: getHeaders() });
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Notification: Mark All Read
  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST', headers: getHeaders() });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 max-w-md">
          <span className="text-emerald-400 text-lg">🌱</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Main Role Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 animate-spin flex items-center justify-center text-white text-xl">
              🌱
            </div>
            <h2 className="text-base font-bold text-slate-800 mt-4">Connecting to FOODLOOP Campus Hub...</h2>
            <p className="text-xs text-slate-500 mt-1">Checking live surplus inventory and mess logs</p>
          </div>
        ) : (
          <>
            {currentUser?.role === 'student' && (
              <StudentDashboard
                foodItems={foodItems}
                reservations={reservations}
                onReserve={handleReserve}
                onCancelReservation={handleCancelReservation}
                onReportWaste={handleLogWaste}
              />
            )}

            {currentUser?.role === 'canteen' && (
              <CanteenDashboard
                canteenListings={foodItems}
                reservations={reservations}
                onAddFood={handleAddFood}
                onVerifyPickup={handleVerifyPickup}
                onUpdateStatus={handleUpdateFoodStatus}
              />
            )}

            {currentUser?.role === 'hostel' && (
              <HostelDashboard
                reports={wasteReports}
                stats={stats}
                onLogWaste={handleLogWaste}
              />
            )}

            {currentUser?.role === 'ngo' && (
              <NgoDashboard
                currentUser={currentUser}
                availableFood={foodItems}
                donations={donations}
                onRequestDonation={handleRequestDonation}
                onUpdateStatus={handleUpdateDonationStatus}
              />
            )}

            {currentUser?.role === 'admin' && (
              <AdminDashboard
                stats={stats}
                users={allUsers}
                foodItems={foodItems}
                reservations={reservations}
                wasteReports={wasteReports}
                onVerifyUser={handleVerifyUser}
                onExportReports={handleExportCSV}
                onRefreshData={() => fetchAllData()}
              />
            )}
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onQuickSwitch={handleSwitchRole}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/90 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌱</span>
              <span className="font-extrabold text-[#14532d] text-sm">
                FOOD<span className="text-emerald-600">LOOP</span>
              </span>
              <span className="text-slate-400">|</span>
              <span className="font-semibold text-slate-600">Waste Less. Share More.</span>
            </div>

            <div className="flex items-center gap-6 text-slate-500 text-xs">
              <span className="bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
                Formula: Waste % = (Wasted / Prepared) × 100
              </span>
              <span className="hidden sm:inline">MySQL Database: <code className="text-emerald-700 font-mono">foodloop_db</code></span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div>
              Designed for Campus Sustainability • Connecting Canteens, Hostels, Students & Community NGOs
            </div>
            <div className="flex items-center gap-3">
              <span>MVC Architecture</span>
              <span>•</span>
              <span>RESTful API</span>
              <span>•</span>
              <span>Real-time Inventory</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
