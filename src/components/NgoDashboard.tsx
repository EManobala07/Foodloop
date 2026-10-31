import React, { useState } from 'react';
import { FoodItem, Donation, User } from '../types';
import { HeartHandshake, ShieldCheck, MapPin, Clock, ArrowRight, CheckCircle, Truck, Users, AlertCircle, X } from 'lucide-react';

interface NgoDashboardProps {
  currentUser: User | null;
  availableFood: FoodItem[];
  donations: Donation[];
  onRequestDonation: (foodId: number, quantity: number, notes: string, beneficiaries: number) => Promise<boolean>;
  onUpdateStatus: (donationId: number, status: Donation['collection_status'], beneficiaries?: number) => Promise<boolean>;
}

export const NgoDashboard: React.FC<NgoDashboardProps> = ({
  currentUser,
  availableFood,
  donations,
  onRequestDonation,
  onUpdateStatus
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'tracker' | 'history'>('available');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [requestQty, setRequestQty] = useState(10);
  const [beneficiaries, setBeneficiaries] = useState(25);
  const [notes, setNotes] = useState('Distributing to Mother Teresa Community Night Shelter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  const isVerified = currentUser?.is_verified ?? true;

  const handleOpenRequest = (food: FoodItem) => {
    setSelectedFood(food);
    setRequestQty(Math.min(15, food.quantity));
    setBeneficiaries(Math.min(15, food.quantity) * 2);
    setRequestSuccess(null);
  };

  const handleSubmitRequest = async () => {
    if (!selectedFood) return;
    setIsSubmitting(true);
    const ok = await onRequestDonation(selectedFood.food_id, requestQty, notes, beneficiaries);
    setIsSubmitting(false);
    if (ok) {
      setRequestSuccess(`Request confirmed for ${requestQty} portions! Food is reserved for your volunteer pickup.`);
      setTimeout(() => {
        setSelectedFood(null);
        setRequestSuccess(null);
        setActiveTab('tracker');
      }, 2000);
    }
  };

  const activeDonations = donations.filter(d => d.collection_status !== 'distributed');
  const totalBeneficiariesFed = donations.reduce((acc, d) => acc + (d.beneficiaries_fed || 0), 0);
  const totalPortionsRedistributed = donations.reduce((acc, d) => acc + d.quantity, 0);

  return (
    <div className="space-y-6">
      {/* NGO Greeting & Verification Status */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-100 text-teal-800">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                NGO & Food Redistribution Network
              </h1>
              {isVerified ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Partner NGO
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Pending Admin Verification
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Connect surplus cafeteria food with local shelters, slum schools, and community kitchens across the city.
            </p>
          </div>
        </div>

        {/* Impact stats pill */}
        <div className="flex items-center gap-4 bg-teal-50/60 border border-teal-100 px-4 py-2.5 rounded-2xl">
          <div>
            <div className="text-xs font-bold text-teal-900">{totalBeneficiariesFed} People</div>
            <div className="text-[10px] text-teal-700">Fed Through Loop</div>
          </div>
          <div className="h-6 w-px bg-teal-200" />
          <div>
            <div className="text-xs font-bold text-teal-900">{totalPortionsRedistributed} Portions</div>
            <div className="text-[10px] text-teal-700">Rescued from Bins</div>
          </div>
        </div>
      </div>

      {!isVerified && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong>NGO Account Verification Required:</strong> Your organization profile is under review by the Campus Administration. You can view surplus food listings, but food reservation will be unlocked once approved by the Admin Dashboard.
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'available'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Available Campus Surplus ({availableFood.length})
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'tracker'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Distribution Pipeline ({activeDonations.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'history'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Redistribution Impact History ({donations.length})
        </button>
      </div>

      {/* TAB 1: AVAILABLE FOOD */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableFood.map(item => (
            <div key={item.food_id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="relative h-44 bg-slate-100">
                  <img src={item.image_url} alt={item.food_name} className="w-full h-full object-cover" />
                  <span className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {item.food_type}
                  </span>
                  <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {item.quantity} {item.unit} available
                  </span>
                </div>

                <div className="p-4">
                  <div className="text-[11px] font-bold uppercase text-emerald-700">{item.category}</div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{item.food_name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 p-2 rounded-xl">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold line-clamp-1">{item.pickup_location}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  disabled={!isVerified || item.quantity <= 0}
                  onClick={() => handleOpenRequest(item)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isVerified && item.quantity > 0
                      ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Request for Redistribution</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIVE DISTRIBUTION TRACKER */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">
              Live Volunteer Dispatch & Status Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Update stages as your volunteers pick up from canteen counters and deliver to beneficiaries.
            </p>
          </div>

          {activeDonations.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <p className="text-xs text-slate-500">No active redistribution batches in transit. Browse surplus food to claim new batches.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDonations.map(don => {
                const statuses: Donation['collection_status'][] = ['requested', 'in_transit', 'collected', 'distributed'];
                return (
                  <div key={don.donation_id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          Batch #{don.donation_id}
                        </span>
                        <h4 className="text-base font-black text-slate-900 mt-1">{don.food_name}</h4>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">
                          Quantity: {don.quantity} {don.unit} • Target Beneficiaries: {don.beneficiaries_fed}
                        </p>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        {new Date(don.donation_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Pickup: {don.pickup_location}</span>
                      </div>
                      <p className="italic text-slate-500">{don.notes || 'No delivery notes'}</p>
                    </div>

                    {/* Stepper Status Buttons */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">
                        Update Pipeline Status:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {statuses.map(st => {
                          const isCurrent = don.collection_status === st;
                          return (
                            <button
                              key={st}
                              onClick={() => onUpdateStatus(don.donation_id, st)}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                isCurrent
                                  ? 'bg-teal-700 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {st.replace('_', ' ')}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: IMPACT HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Completed Community Feedings & Distributions
            </h3>
            <span className="text-xs text-slate-400">Total: {donations.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Food Item</th>
                  <th className="py-3 px-4">Quantity Rescued</th>
                  <th className="py-3 px-4">People Fed</th>
                  <th className="py-3 px-4">Destination & Notes</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map(don => (
                  <tr key={don.donation_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {new Date(don.donation_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{don.food_name}</td>
                    <td className="py-3 px-4 font-black text-teal-700">{don.quantity} {don.unit}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{don.beneficiaries_fed} people</td>
                    <td className="py-3 px-4 text-slate-600">{don.notes}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {don.collection_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQUEST MODAL */}
      {selectedFood && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedFood(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-teal-700 text-xs font-bold flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4" />
              Community Redistribution Request
            </span>

            <h3 className="text-xl font-black text-slate-900 mt-2">
              {selectedFood.food_name}
            </h3>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity to Claim (Max: {selectedFood.quantity} {selectedFood.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedFood.quantity}
                  value={requestQty}
                  onChange={e => {
                    const q = parseInt(e.target.value, 10) || 1;
                    setRequestQty(q);
                    setBeneficiaries(q * 2);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Beneficiaries Fed *
                </label>
                <input
                  type="number"
                  min="1"
                  value={beneficiaries}
                  onChange={e => setBeneficiaries(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shelter / Distribution Destination *
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-teal-600"
                />
              </div>
            </div>

            {requestSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800">
                {requestSuccess}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setSelectedFood(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting || !!requestSuccess}
                onClick={handleSubmitRequest}
                className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
