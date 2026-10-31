import React, { useState } from 'react';
import { DashboardStats, User, FoodItem, Reservation, WasteReport } from '../types';
import { WeeklyWasteChart, MealBreakdownChart, WasteGauge } from './Charts';
import { 
  ShieldCheck, Users, Utensils, HeartHandshake, Download, CheckCircle2, 
  XCircle, AlertOctagon, TrendingDown, Layers, FileSpreadsheet, RefreshCw 
} from 'lucide-react';

interface AdminDashboardProps {
  stats: DashboardStats;
  users: User[];
  foodItems: FoodItem[];
  reservations: Reservation[];
  wasteReports: WasteReport[];
  onVerifyUser: (userId: number, isVerified: boolean) => Promise<boolean>;
  onExportReports: () => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  users,
  foodItems,
  reservations,
  wasteReports,
  onVerifyUser,
  onExportReports,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'listings' | 'waste-logs'>('analytics');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Admin Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-950 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Campus Food Sustainability & Administration
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                Dean Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Campus-wide oversight: audits, user approvals, real-time waste metrics, and NGO partner compliance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onExportReports}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Waste CSV</span>
          </button>
          <button
            onClick={onRefreshData}
            title="Refresh Real Data"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8 Primary Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Students</span>
          <div className="text-xl font-black text-slate-800 mt-1">{stats.total_students}</div>
          <span className="text-[10px] text-slate-500">Registered</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Canteens</span>
          <div className="text-xl font-black text-slate-800 mt-1">{stats.total_canteens}</div>
          <span className="text-[10px] text-slate-500">Active Messes</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Listings</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{stats.total_food_listings}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">{stats.active_food_listings} live</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Requests</span>
          <div className="text-xl font-black text-slate-800 mt-1">{stats.total_food_requests}</div>
          <span className="text-[10px] text-slate-500">Reservations</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-teal-600 uppercase block">NGOs</span>
          <div className="text-xl font-black text-teal-700 mt-1">{stats.active_ngos}</div>
          <span className="text-[10px] text-teal-600">Verified</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-orange-200 bg-orange-50/20 shadow-xs">
          <span className="text-[10px] font-bold text-orange-600 uppercase block">Food Wasted</span>
          <div className="text-xl font-black text-orange-600 mt-1">{stats.total_food_wasted_kg} <span className="text-xs font-normal">kg</span></div>
          <span className="text-[10px] text-slate-500">Audited total</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase block">Food Saved</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{stats.total_food_saved_kg} <span className="text-xs font-normal">kg</span></div>
          <span className="text-[10px] text-emerald-600 font-semibold">Rescued</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Waste %</span>
          <div className="text-xl font-black text-slate-900 mt-1">{stats.waste_percentage}%</div>
          <span className="text-[10px] text-slate-400">Formula ratio</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'analytics'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sustainability Analytics & Charts
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'users'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          User Approvals & Role Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'listings'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All Food Listings ({foodItems.length})
        </button>
        <button
          onClick={() => setActiveTab('waste-logs')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'waste-logs'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Hostel Waste Reports ({wasteReports.length})
        </button>
      </div>

      {/* TAB 1: ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Campus Daily Waste vs Saved Trajectory</h3>
                  <p className="text-xs text-slate-500">Day-by-day food balance audit across campus units</p>
                </div>
              </div>
              <WeeklyWasteChart data={stats.weekly_trends} />
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Calculated Waste Ratio</h3>
                <p className="text-xs text-slate-500 mb-2">Target campus efficiency threshold</p>
                <WasteGauge percentage={stats.waste_percentage} />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Breakdown by Meal Service
                </h4>
                <MealBreakdownChart data={stats.meal_breakdown} />
              </div>
            </div>
          </div>

          {/* Environmental Carbon & Water Offset Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Environmental Carbon Footprint Offset
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-1">
                {stats.co2_saved_kg} kg Greenhouse CO₂ Prevented
              </h3>
              <p className="text-xs text-emerald-200 mt-1 max-w-xl">
                Redistributing {stats.total_food_saved_kg} kg of campus meals prevented decomposing landfill methane emissions. Equivalent to planting ~{Math.round(stats.co2_saved_kg / 15)} campus trees.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl text-center border border-white/20 shrink-0">
              <span className="text-2xl font-black text-emerald-300">{stats.total_portions_saved}</span>
              <span className="block text-[11px] font-semibold text-emerald-100 uppercase mt-0.5">Meals Diverted</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY & VERIFICATION */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Registered University Members & Partners
              </h3>
              <p className="text-xs text-slate-400">
                Authorize NGOs for food collection permissions or review canteen accounts
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 mr-1">Filter Role:</span>
              {['All', 'student', 'canteen', 'hostel', 'ngo', 'admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${
                    roleFilter === r ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Department / Organization</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.user_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{u.phone}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.organization_name || 'Standard Account'}</td>
                    <td className="py-3.5 px-4">
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onVerifyUser(u.user_id, !u.is_verified)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          u.is_verified
                            ? 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {u.is_verified ? 'Revoke Approval' : 'Approve NGO / Staff'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL FOOD LISTINGS */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Campus Surplus Food Master Registry
            </h3>
            <span className="text-xs text-slate-400">Total: {foodItems.length} listings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Food Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Quantity Available</th>
                  <th className="py-3 px-4">Pickup Point</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploader</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {foodItems.map(item => (
                  <tr key={item.food_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.food_name}</td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">{item.category}</td>
                    <td className="py-3 px-4 font-black text-slate-800">{item.quantity} {item.unit}</td>
                    <td className="py-3 px-4 text-slate-600">{item.pickup_location}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(item.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{item.uploader_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: WASTE REPORTS LOGS */}
      {activeTab === 'waste-logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Campus Leftover Waste Audit Reports
              </h3>
              <p className="text-xs text-slate-400">
                Logged by dining hall mess managers and student observers
              </p>
            </div>
            <button
              onClick={onExportReports}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Report Date</th>
                  <th className="py-3 px-4">Meal Period</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Leftover Item</th>
                  <th className="py-3 px-4">Waste Weight</th>
                  <th className="py-3 px-4">Prepared Weight</th>
                  <th className="py-3 px-4">Recorded Reason</th>
                  <th className="py-3 px-4">Audited By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wasteReports.map(r => (
                  <tr key={r.report_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.report_date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r.meal_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{r.location}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.food_name}</td>
                    <td className="py-3 px-4 font-black text-orange-600">{r.quantity} {r.unit}</td>
                    <td className="py-3 px-4 text-slate-500">{r.quantity_prepared} {r.unit}</td>
                    <td className="py-3 px-4 text-slate-600 italic">{r.waste_reason}</td>
                    <td className="py-3 px-4 text-slate-500">{r.reporter_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
