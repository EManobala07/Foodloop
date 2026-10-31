import React, { useState } from 'react';
import { WasteReport, DashboardStats } from '../types';
import { WeeklyWasteChart, MealBreakdownChart, WasteGauge } from './Charts';
import { Building2, PlusCircle, Calendar, AlertTriangle, CheckCircle, TrendingDown, ClipboardList, Flame } from 'lucide-react';

interface HostelDashboardProps {
  reports: WasteReport[];
  stats: DashboardStats;
  onLogWaste: (data: any) => Promise<boolean>;
}

export const HostelDashboard: React.FC<HostelDashboardProps> = ({
  reports,
  stats,
  onLogWaste
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'log' | 'history'>('overview');
  const [filterMeal, setFilterMeal] = useState<string>('All');

  // Log Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    food_name: '',
    quantity: '12.0',
    quantity_prepared: '95.0',
    unit: 'kg',
    meal_type: 'Dinner',
    location: 'Hostel Block 3 Dining Mess',
    waste_reason: 'Low student turnout due to campus fest',
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    report_date: todayStr
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ok = await onLogWaste({
      ...form,
      quantity: parseFloat(form.quantity),
      quantity_prepared: parseFloat(form.quantity_prepared)
    });
    setIsSubmitting(false);
    if (ok) {
      setSubmitSuccess(true);
      setForm({
        food_name: '',
        quantity: '10.0',
        quantity_prepared: '80.0',
        unit: 'kg',
        meal_type: 'Dinner',
        location: 'Hostel Block 3 Dining Mess',
        waste_reason: 'Low student turnout due to campus fest',
        image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        report_date: todayStr
      });
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('overview');
      }, 1500);
    }
  };

  const filteredReports = reports.filter(r => {
    if (filterMeal !== 'All' && r.meal_type !== filterMeal) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-100 text-orange-700">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Hostel Dining Halls & Mess Waste Module
              </h1>
              <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Audited Mess
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Record daily post-meal leftover food weights, calculate waste ratio, and identify kitchen over-preparation.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('log')}
          className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Leftover Food</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'overview'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Waste Analytics & Trends
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'history'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Leftover Audit Logs ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'log'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          + Log Meal Leftover
        </button>
      </div>

      {/* TAB 1: OVERVIEW & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Food Prepared</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {stats.total_food_prepared_kg} <span className="text-sm font-semibold text-slate-500">kg</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Across monitored meal sessions</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-orange-200 bg-orange-50/20 shadow-xs">
              <span className="text-xs font-bold text-orange-600 uppercase">Total Food Wasted</span>
              <div className="text-2xl font-black text-orange-600 mt-1">
                {stats.total_food_wasted_kg} <span className="text-sm font-semibold text-orange-500">kg</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Direct unserved plate & pot excess</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <span className="text-xs font-bold text-emerald-700 uppercase">Food Saved Via Loop</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {stats.total_food_saved_kg} <span className="text-sm font-semibold text-emerald-600">kg</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                ~{stats.total_portions_saved} student portions redistributed
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Waste Percentage</span>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {stats.waste_percentage}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">(Wasted / Prepared) × 100</p>
            </div>
          </div>

          {/* Interactive Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Trend Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Weekly Food Balance Analysis</h3>
                  <p className="text-xs text-slate-500">Food Prepared vs Wasted vs Saved per day (kg)</p>
                </div>
              </div>
              <WeeklyWasteChart data={stats.weekly_trends} />
            </div>

            {/* Waste Ratio Gauge & Meal Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Calculated Waste Ratio</h3>
                <p className="text-xs text-slate-500 mb-2">Automated campus threshold meter</p>
                <WasteGauge percentage={stats.waste_percentage} />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
                  Wastage by Meal Type
                </h4>
                <MealBreakdownChart data={stats.meal_breakdown} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800">
              Hostel Leftover Records
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Meal:</span>
              {['All', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => (
                <button
                  key={meal}
                  onClick={() => setFilterMeal(meal)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    filterMeal === meal ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Meal Period</th>
                  <th className="py-3 px-4">Food Item</th>
                  <th className="py-3 px-4">Quantity Wasted</th>
                  <th className="py-3 px-4">Quantity Prepared</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Primary Reason</th>
                  <th className="py-3 px-4">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map(r => (
                  <tr key={r.report_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">{r.report_date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r.meal_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.food_name}</td>
                    <td className="py-3 px-4 font-black text-orange-600">{r.quantity} {r.unit}</td>
                    <td className="py-3 px-4 text-slate-500">{r.quantity_prepared} {r.unit}</td>
                    <td className="py-3 px-4 text-slate-600">{r.location}</td>
                    <td className="py-3 px-4 text-slate-600 italic">{r.waste_reason}</td>
                    <td className="py-3 px-4 text-slate-500">{r.reporter_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOG LEFTOVER FORM */}
      {activeTab === 'log' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-1 rounded-full">
              Hostel Mess Audit
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Log Leftover Food After Meal Service
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Accurately logging unconsumed food weights allows the administration to adjust purchasing contracts and avoid overcooking.
            </p>
          </div>

          {submitSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Hostel waste report recorded successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Food Item Leftover *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sambar Rice, Rasam & Chapati batch"
                value={form.food_name}
                onChange={e => setForm({ ...form, food_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity Leftover (kg) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  required
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Prepared Weight (kg) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={form.quantity_prepared}
                  onChange={e => setForm({ ...form, quantity_prepared: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meal Period *
                </label>
                <select
                  value={form.meal_type}
                  onChange={e => setForm({ ...form, meal_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hostel Dining Location *
                </label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Root Cause / Wastage Reason *
              </label>
              <select
                value={form.waste_reason}
                onChange={e => setForm({ ...form, waste_reason: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
              >
                <option value="Over-preparation estimation">Over-preparation estimation</option>
                <option value="Low student turnout due to campus fest">Low student turnout due to campus fest</option>
                <option value="Low student turnout due to exams/vacation">Low student turnout due to exams/vacation</option>
                <option value="Kitchen recipe / seasoning mishap">Kitchen recipe / seasoning mishap</option>
                <option value="Spillage or storage failure">Spillage or storage failure</option>
                <option value="Perishability / Short shelf life">Perishability / Short shelf life</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? 'Logging...' : 'Save Waste Audit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
