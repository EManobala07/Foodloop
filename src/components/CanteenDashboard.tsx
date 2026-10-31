import React, { useState } from 'react';
import { FoodItem, Reservation, FoodCategory, FoodType } from '../types';
import { PlusCircle, Clock, MapPin, CheckCircle, AlertOctagon, Utensils, Hash, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

interface CanteenDashboardProps {
  canteenListings: FoodItem[];
  reservations: Reservation[];
  onAddFood: (data: any) => Promise<boolean>;
  onVerifyPickup: (reservationId: number, code?: string) => Promise<boolean>;
  onUpdateStatus: (foodId: number, status: string) => Promise<boolean>;
}

export const CanteenDashboard: React.FC<CanteenDashboardProps> = ({
  canteenListings,
  reservations,
  onAddFood,
  onVerifyPickup,
  onUpdateStatus
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'add' | 'verify'>('listings');
  const [pickupCodeInput, setPickupCodeInput] = useState<{ [resId: number]: string }>({});
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // New Listing Form State
  const defaultExpiry = () => {
    const d = new Date(Date.now() + 4 * 3600 * 1000);
    return d.toISOString().slice(0, 16);
  };
  const defaultPrep = () => {
    const d = new Date(Date.now() - 1 * 3600 * 1000);
    return d.toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    food_name: '',
    category: 'Meals' as FoodCategory,
    quantity: '20',
    unit: 'servings',
    description: '',
    food_type: 'Vegetarian' as FoodType,
    pickup_location: 'Central Canteen - Counter 2 (Hot Tray)',
    prepared_at: defaultPrep(),
    expiry_time: defaultExpiry(),
    allergen_info: 'None',
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const samplePhotoOptions = [
    { label: 'Meals / Pulav', url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80' },
    { label: 'Idli / Sambar', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80' },
    { label: 'Chapatis / Curry', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80' },
    { label: 'Sandwiches', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80' },
    { label: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80' }
  ];

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ok = await onAddFood({
      ...form,
      quantity: parseInt(form.quantity, 10)
    });
    setIsSubmitting(false);
    if (ok) {
      setSubmitSuccess(true);
      setForm({
        food_name: '',
        category: 'Meals',
        quantity: '20',
        unit: 'servings',
        description: '',
        food_type: 'Vegetarian',
        pickup_location: 'Central Canteen - Counter 2 (Hot Tray)',
        prepared_at: defaultPrep(),
        expiry_time: defaultExpiry(),
        allergen_info: 'None',
        image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
      });
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('listings');
      }, 1500);
    }
  };

  const handleVerify = async (resId: number) => {
    const code = pickupCodeInput[resId];
    setVerifyError(null);
    setVerifySuccess(null);
    const ok = await onVerifyPickup(resId, code);
    if (ok) {
      setVerifySuccess(`Reservation #${resId} successfully verified & marked collected!`);
      setTimeout(() => setVerifySuccess(null), 3500);
    } else {
      setVerifyError('Incorrect verification code. Please check student screen.');
      setTimeout(() => setVerifyError(null), 3500);
    }
  };

  const pendingReservations = reservations.filter(r => r.pickup_status === 'reserved');
  const totalReservedQuantity = pendingReservations.reduce((acc, r) => acc + r.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Utensils className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Canteen & Dining Kitchen Operations
              </h1>
              <p className="text-xs text-slate-500">
                Log surplus lunch/dinner batches, monitor student reservations, and verify customer pickup codes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('add')}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Surplus Food</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'listings'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Food Inventory ({canteenListings.length})
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'verify'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Student Reservations & Verification ({pendingReservations.length})
          {pendingReservations.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px]">
              {totalReservedQuantity} items
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'add'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          + Add New Surplus Batch
        </button>
      </div>

      {/* Alerts */}
      {verifySuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{verifySuccess}</span>
        </div>
      )}
      {verifyError && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>{verifyError}</span>
        </div>
      )}

      {/* TAB 1: ACTIVE LISTINGS TABLE */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Campus Surplus Food Listings
            </h3>
            <span className="text-xs text-slate-400">
              Showing active, reserved, and expired items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Food Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Diet</th>
                  <th className="py-3 px-4">Remaining Stock</th>
                  <th className="py-3 px-4">Pickup Point</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {canteenListings.map(item => (
                  <tr key={item.food_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.food_name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{item.food_name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{item.allergen_info || 'No allergens'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">{item.category}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.food_type === 'Vegetarian' ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {item.food_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {item.quantity}
                      </span>{' '}
                      <span className="text-slate-500 font-medium">{item.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{item.pickup_location}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(item.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'reserved'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'collected'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {item.status === 'available' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(item.food_id, 'collected')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Mark Collected
                          </button>
                          <button
                            onClick={() => onUpdateStatus(item.food_id, 'expired')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-rose-100 hover:text-rose-800 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Expire
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFICATION & RESERVATIONS COUNTER */}
      {activeTab === 'verify' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">
              Student Pickup Verification Station
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              When a student arrives at your counter, ask for their 6-character code (e.g. FL-8492) or verify their name to complete handover.
            </p>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <p className="text-xs text-slate-500">No student reservations recorded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map(res => {
                const isPending = res.pickup_status === 'reserved';
                return (
                  <div
                    key={res.reservation_id}
                    className={`bg-white rounded-2xl p-5 border shadow-xs transition-all ${
                      isPending ? 'border-orange-300 ring-2 ring-orange-100' : 'border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isPending ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isPending ? 'Pending Handover' : 'Completed Collection'}
                        </span>
                        <h4 className="text-base font-black text-slate-900 mt-1.5">{res.food_name}</h4>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">
                          Quantity: <span className="font-bold text-slate-900">{res.quantity} {res.unit || 'servings'}</span>
                        </p>
                      </div>

                      {/* Expected Code */}
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Student Code</span>
                        <div className="text-base font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {res.verification_code}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                      <div><strong className="text-slate-800">Student:</strong> {res.student_name} ({res.student_phone})</div>
                      <div><strong className="text-slate-800">Time Reserved:</strong> {new Date(res.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>

                    {isPending && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Enter student code (e.g. FL-8492)"
                          value={pickupCodeInput[res.reservation_id] ?? res.verification_code}
                          onChange={e => setPickupCodeInput({ ...pickupCodeInput, [res.reservation_id]: e.target.value })}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-emerald-600"
                        />
                        <button
                          onClick={() => handleVerify(res.reservation_id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Verify & Handover</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADD SURPLUS FOOD FORM */}
      {activeTab === 'add' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
              Post Surplus Meal
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Add Surplus Food to Live Student Feed
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              List clean unserved canteen or mess portions. Students and campus volunteers will be notified instantly.
            </p>
          </div>

          {submitSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Surplus food posted successfully! Returning to active inventory...</span>
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Food Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Indian Lemon Rice"
                  value={form.food_name}
                  onChange={e => setForm({ ...form, food_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as FoodCategory })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                >
                  <option value="Meals">Meals</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Fresh Fruits">Fresh Fruits</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Surplus Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Unit *
                </label>
                <select
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                >
                  <option value="servings">servings</option>
                  <option value="plates">plates</option>
                  <option value="boxes">boxes</option>
                  <option value="kg">kg</option>
                  <option value="packets">packets</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dietary Classification *
                </label>
                <select
                  value={form.food_type}
                  onChange={e => setForm({ ...form, food_type: e.target.value as FoodType })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Ingredients
              </label>
              <textarea
                rows={2}
                placeholder="Briefly describe the dish preparation and temperature..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup Counter / Station *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Canteen Counter 1 - Hot Bar"
                  value={form.pickup_location}
                  onChange={e => setForm({ ...form, pickup_location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Allergen Information
                </label>
                <input
                  type="text"
                  placeholder="e.g. None, Contains Dairy, Contains Peanuts"
                  value={form.allergen_info}
                  onChange={e => setForm({ ...form, allergen_info: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preparation Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.prepared_at}
                  onChange={e => setForm({ ...form, prepared_at: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup Deadline (Expiry) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.expiry_time}
                  onChange={e => setForm({ ...form, expiry_time: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Photo Selection / URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Food Image URL or Quick Preset
              </label>
              <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                {samplePhotoOptions.map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setForm({ ...form, image_url: opt.url })}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 whitespace-nowrap font-semibold"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={form.image_url}
                onChange={e => setForm({ ...form, image_url: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Posting...' : 'Publish Surplus Listing'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
