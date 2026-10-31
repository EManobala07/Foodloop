import React, { useState } from 'react';
import { FoodItem, Reservation, FoodCategory, FoodType } from '../types';
import { 
  Clock, MapPin, AlertCircle, CheckCircle, Search, 
  Leaf, UtensilsCrossed, Calendar, Hash, X, Check, AlertTriangle, ArrowRight, Sparkles 
} from 'lucide-react';

interface StudentDashboardProps {
  foodItems: FoodItem[];
  reservations: Reservation[];
  onReserve: (foodId: number, quantity: number) => Promise<boolean>;
  onCancelReservation: (reservationId: number) => Promise<boolean>;
  onReportWaste: (data: { food_name: string; quantity: number; meal_type: string; location: string; waste_reason: string }) => Promise<boolean>;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  foodItems,
  reservations,
  onReserve,
  onCancelReservation,
  onReportWaste
}) => {
  const [activeTab, setActiveTab] = useState<'surplus' | 'my-reservations' | 'report'>('surplus');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDiet, setSelectedDiet] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reserve Modal State
  const [reservingItem, setReservingItem] = useState<FoodItem | null>(null);
  const [reserveQty, setReserveQty] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reserveSuccessMsg, setReserveSuccessMsg] = useState<string | null>(null);

  // Waste Report State
  const [wasteForm, setWasteForm] = useState({
    food_name: '',
    quantity: '2.5',
    meal_type: 'Lunch',
    location: 'Hostel Block A Mess',
    waste_reason: 'Leftover unserved portions'
  });
  const [wasteReportSuccess, setWasteReportSuccess] = useState(false);

  const categories: (FoodCategory | 'All')[] = ['All', 'Meals', 'Breakfast', 'Snacks', 'Fresh Fruits', 'Bakery'];
  const diets: (FoodType | 'All')[] = ['All', 'Vegetarian', 'Vegan', 'Non-Vegetarian'];

  // Filter items
  const filteredItems = foodItems.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedDiet !== 'All' && item.food_type !== selectedDiet) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = item.food_name.toLowerCase().includes(q) ||
                    item.description.toLowerCase().includes(q) ||
                    item.pickup_location.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate time remaining
  const getTimeRemaining = (expiryTime: string) => {
    const diff = new Date(expiryTime).getTime() - new Date().getTime();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes} mins left`;
  };

  const handleOpenReserve = (item: FoodItem) => {
    setReservingItem(item);
    setReserveQty(1);
    setReserveSuccessMsg(null);
  };

  const handleConfirmReservation = async () => {
    if (!reservingItem) return;
    setIsSubmitting(true);
    const ok = await onReserve(reservingItem.food_id, reserveQty);
    setIsSubmitting(false);
    if (ok) {
      setReserveSuccessMsg(`Successfully reserved ${reserveQty} ${reservingItem.unit}! Check "My Reservations" for your pickup code.`);
      setTimeout(() => {
        setReservingItem(null);
        setReserveSuccessMsg(null);
      }, 2500);
    }
  };

  const handleSubmitWasteReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteForm.food_name || !wasteForm.quantity) return;
    setIsSubmitting(true);
    const ok = await onReportWaste({
      food_name: wasteForm.food_name,
      quantity: parseFloat(wasteForm.quantity),
      meal_type: wasteForm.meal_type,
      location: wasteForm.location,
      waste_reason: wasteForm.waste_reason
    });
    setIsSubmitting(false);
    if (ok) {
      setWasteReportSuccess(true);
      setWasteForm({
        food_name: '',
        quantity: '2.5',
        meal_type: 'Lunch',
        location: 'Hostel Block A Mess',
        waste_reason: 'Leftover unserved portions'
      });
      setTimeout(() => setWasteReportSuccess(false), 3000);
    }
  };

  const activeReservations = reservations.filter(r => r.pickup_status === 'reserved');
  const pastReservations = reservations.filter(r => r.pickup_status !== 'reserved');

  return (
    <div className="space-y-6">
      {/* Student Hero Greeting */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <UtensilsCrossed className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/40 text-emerald-100 text-xs font-semibold backdrop-blur-xs mb-3 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            Zero Campus Food Hunger & Waste
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Available Surplus Meals & Snacks
          </h1>
          <p className="mt-2 text-sm text-emerald-100 leading-relaxed">
            Campus canteens and hostel dining halls package fresh excess food before meal periods close. Reserve free or subsidized portions to eat delicious meals and stop food waste!
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('surplus')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'surplus'
                  ? 'bg-white text-emerald-800 shadow-md scale-105'
                  : 'bg-emerald-900/50 text-emerald-100 hover:bg-emerald-900/80'
              }`}
            >
              🥘 Browse Surplus Food ({foodItems.filter(f => f.status === 'available').length})
            </button>
            <button
              onClick={() => setActiveTab('my-reservations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'my-reservations'
                  ? 'bg-white text-emerald-800 shadow-md scale-105'
                  : 'bg-emerald-900/50 text-emerald-100 hover:bg-emerald-900/80'
              }`}
            >
              🏷️ My Reservations ({activeReservations.length})
              {activeReservations.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-orange-500 text-white rounded-full text-[10px]">
                  Active
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'report'
                  ? 'bg-white text-emerald-800 shadow-md scale-105'
                  : 'bg-emerald-900/50 text-emerald-100 hover:bg-emerald-900/80'
              }`}
            >
              📢 Report Campus Waste
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: SURPLUS FOOD FEED */}
      {activeTab === 'surplus' && (
        <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search meals, snacks, or locations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white transition-colors"
                />
              </div>

              {/* Dietary Toggle */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Diet:
                </span>
                {diets.map(diet => (
                  <button
                    key={diet}
                    onClick={() => setSelectedDiet(diet)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedDiet === diet
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 mr-1 shrink-0">Category:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Food Cards Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
              <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No surplus food currently matches your filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Check back shortly! Campus canteens upload excess prepared food right around meal completion times (10:30 AM, 2:30 PM, 5:30 PM, and 9:00 PM).
              </p>
              <button
                onClick={() => { setSelectedCategory('All'); setSelectedDiet('All'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => {
                const isAvailable = item.status === 'available' && item.quantity > 0;
                const timeLeft = getTimeRemaining(item.expiry_time);
                const isUrgent = timeLeft.includes('mins') || timeLeft === 'Expired';

                return (
                  <div
                    key={item.food_id}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Food Photo Container */}
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.food_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback placeholder
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      {/* Demo Badge */}
                      {item.is_demo && (
                        <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Demo Listing
                        </div>
                      )}

                      {/* Expiry Countdown Pill */}
                      <div className={`absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs ${
                        isUrgent ? 'bg-orange-500/90 text-white animate-pulse' : 'bg-slate-900/70 text-white'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{timeLeft}</span>
                      </div>

                      {/* Food Type Pill */}
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs ${
                          item.food_type === 'Vegetarian'
                            ? 'bg-emerald-600 text-white'
                            : item.food_type === 'Vegan'
                            ? 'bg-teal-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}>
                          {item.food_type}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                            {item.category}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {item.uploader_name}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {item.food_name}
                        </h3>

                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>

                        {/* Location */}
                        <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-700 bg-slate-50 p-2 rounded-xl">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-semibold line-clamp-1">{item.pickup_location}</span>
                        </div>

                        {/* Allergen Info */}
                        {item.allergen_info && item.allergen_info !== 'None' && (
                          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="line-clamp-1 font-medium">Allergens: {item.allergen_info}</span>
                          </div>
                        )}
                      </div>

                      {/* Stock & Action Button */}
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2 text-xs">
                          <span className="font-semibold text-slate-600">Available portions:</span>
                          <span className="font-bold text-slate-900">
                            {item.quantity} {item.unit}
                          </span>
                        </div>

                        {/* Quantity progress visual bar */}
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                          <div
                            className={`h-full rounded-full ${item.quantity > 5 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                            style={{ width: `${Math.min(100, (item.quantity / 30) * 100)}%` }}
                          />
                        </div>

                        <button
                          disabled={!isAvailable}
                          onClick={() => handleOpenReserve(item)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                            isAvailable
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-98'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {isAvailable ? (
                            <>
                              <span>Reserve Now</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <span>All Portions Reserved</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY RESERVATIONS */}
      {activeTab === 'my-reservations' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>🏷️</span> My Food Reservations & Pickup Codes
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Present your unique verification code at the canteen counter to claim your reserved portions.
            </p>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Reservations Yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Browse available surplus meals and reserve free or discounted portions today!
              </p>
              <button
                onClick={() => setActiveTab('surplus')}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Browse Surplus Meals
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Reservations */}
              {activeReservations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-800">
                    Active Pickups Required ({activeReservations.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeReservations.map(res => (
                      <div
                        key={res.reservation_id}
                        className="bg-white border-2 border-emerald-500 rounded-2xl p-5 shadow-sm relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full">
                              Ready for Pickup
                            </span>
                            <h4 className="text-base font-bold text-slate-900 mt-1.5">{res.food_name}</h4>
                            <p className="text-xs font-semibold text-slate-600 mt-0.5">
                              Quantity: {res.quantity} {res.unit || 'servings'}
                            </p>
                          </div>
                          {/* Large Verification Code Badge */}
                          <div className="text-right bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                            <span className="text-[10px] font-bold text-emerald-700 block uppercase">Pickup Code</span>
                            <span className="text-lg font-black text-emerald-900 tracking-wider">
                              {res.verification_code}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-medium">Pickup Point: {res.pickup_location}</span>
                          </div>
                          {res.expiry_time && (
                            <div className="flex items-center gap-1.5 text-orange-700 font-semibold">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span>Pickup Deadline: {new Date(res.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-400">
                            Booked {new Date(res.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={() => onCancelReservation(res.reservation_id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                          >
                            Cancel Reservation
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past / Completed History */}
              {pastReservations.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                    Past Reservation History ({pastReservations.length})
                  </h3>
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                    {pastReservations.map(res => (
                      <div key={res.reservation_id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800">{res.food_name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              res.pickup_status === 'collected'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {res.pickup_status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {res.quantity} {res.unit} • Code: {res.verification_code} • {res.pickup_location}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(res.reservation_time).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REPORT CAMPUS FOOD WASTAGE */}
      {activeTab === 'report' && (
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-1 rounded-full">
              Student Eco-Sentinel
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Report Food Wastage on Campus
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Notice large trays of uneaten food at an event, canteen, or dining mess? Report it so the food waste team can redirect surplus or adjust future meal portions.
            </p>
          </div>

          {wasteReportSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Thank you! Your waste report has been logged in the campus administration system.</span>
            </div>
          )}

          <form onSubmit={handleSubmitWasteReport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Food Item Observed *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Vegetable Pulav, Roti batch, Dal"
                value={wasteForm.food_name}
                onChange={e => setWasteForm({ ...wasteForm, food_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Quantity (kg or portions) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={wasteForm.quantity}
                  onChange={e => setWasteForm({ ...wasteForm, quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meal Period *
                </label>
                <select
                  value={wasteForm.meal_type}
                  onChange={e => setWasteForm({ ...wasteForm, meal_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campus Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Hostel Block B Dining Hall, MBA Seminar Hall"
                value={wasteForm.location}
                onChange={e => setWasteForm({ ...wasteForm, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Reason / Observation *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Unserved extra food after guest seminar, excessive preparation"
                value={wasteForm.waste_reason}
                onChange={e => setWasteForm({ ...wasteForm, waste_reason: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? 'Logging Report...' : 'Submit Campus Waste Report'}
            </button>
          </form>
        </div>
      )}

      {/* RESERVATION CONFIRMATION MODAL */}
      {reservingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setReservingItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Food Reservation Confirmation</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-2">
              {reservingItem.food_name}
            </h3>

            <div className="mt-3 bg-slate-50 p-3 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup Counter:</span>
                <span className="font-bold text-slate-800">{reservingItem.pickup_location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup Deadline:</span>
                <span className="font-bold text-orange-600">
                  {new Date(reservingItem.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dietary Category:</span>
                <span className="font-bold text-emerald-700">{reservingItem.food_type}</span>
              </div>
              {reservingItem.allergen_info && reservingItem.allergen_info !== 'None' && (
                <div className="flex justify-between text-amber-700">
                  <span className="font-semibold">Allergens:</span>
                  <span className="font-bold">{reservingItem.allergen_info}</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Portions to Reserve:
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={reserveQty <= 1}
                  onClick={() => setReserveQty(Math.max(1, reserveQty - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base flex items-center justify-center disabled:opacity-40"
                >
                  -
                </button>
                <span className="text-xl font-black text-slate-800 w-12 text-center">
                  {reserveQty}
                </span>
                <button
                  type="button"
                  disabled={reserveQty >= reservingItem.quantity}
                  onClick={() => setReserveQty(Math.min(reservingItem.quantity, reserveQty + 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base flex items-center justify-center disabled:opacity-40"
                >
                  +
                </button>
                <span className="text-xs text-slate-500 font-medium">
                  (Max {reservingItem.quantity} available)
                </span>
              </div>
            </div>

            {reserveSuccessMsg && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reserveSuccessMsg}</span>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setReservingItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || !!reserveSuccessMsg}
                onClick={handleConfirmReservation}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Reserving...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
