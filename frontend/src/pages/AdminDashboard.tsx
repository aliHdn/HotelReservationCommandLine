import { useMemo, useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { hotels, rooms, formatCurrency, formatDate } from '@/data/demo';
import { Avatar, Badge, statusTone } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Reservation, ReservationStatus } from '@/types';
import {
  BedDouble, LogOut, TrendingUp, DollarSign, CalendarCheck, Users, Search,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout, reservations, updateReservationStatus } = useStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');

  const stats = useMemo(() => computeStats(reservations), [reservations]);

  const filtered = useMemo(() => {
    return reservations
      .filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter))
      .filter((r) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          r.userName.toLowerCase().includes(q) ||
          r.hotelName.toLowerCase().includes(q) ||
          r.roomName.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reservations, query, statusFilter]);

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-10 border-b border-ink-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white">
              <BedDouble className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-serif text-xl leading-none text-ink-900">Aurelia</p>
              <p className="text-[10px] tracking-[0.2em] text-ink-400">ADMIN CONSOLE</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              <Avatar name={user!.name} hue={user!.avatarHue} size={36} />
              <div className="leading-tight">
                <p className="text-sm font-medium text-ink-900">{user!.name}</p>
                <p className="text-xs text-ink-400">Administrator</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-600 transition hover:border-ink-300 hover:bg-ink-50"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-ink-900">Operations overview</h1>
            <p className="mt-1 text-ink-500">Reservations, revenue, and occupancy across all properties.</p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total revenue"
            value={formatCurrency(stats.totalRevenue)}
            delta="+12.4%"
            up
            icon={<DollarSign className="h-5 w-5" />}
            tone="brand"
          />
          <KpiCard
            label="Reservations"
            value={String(stats.totalReservations)}
            delta={`${stats.pending} pending`}
            icon={<CalendarCheck className="h-5 w-5" />}
            tone="teal"
          />
          <KpiCard
            label="Avg. nightly rate"
            value={formatCurrency(stats.avgNightly)}
            delta="+3.1%"
            up
            icon={<TrendingUp className="h-5 w-5" />}
            tone="neutral"
          />
          <KpiCard
            label="Occupancy"
            value={`${stats.occupancy}%`}
            delta={stats.occupancy >= 70 ? 'Healthy' : 'Low'}
            up={stats.occupancy >= 70}
            icon={<Users className="h-5 w-5" />}
            tone="neutral"
          />
        </div>

        
        

        {/* Reservations table */}
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white shadow-soft">
          <div className="flex flex-col gap-3 border-b border-ink-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink-900">All reservations</h2>
              <p className="text-xs text-ink-400">{filtered.length} of {reservations.length} shown</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search guest, hotel, or ID…"
                  className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-200 sm:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'all')}
                className="rounded-lg border border-ink-200 bg-white py-2 pl-3 pr-8 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
              >
                <option value="all">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="px-5 py-3 font-medium">Stay</th>
                  <th className="px-5 py-3 font-medium">Dates</th>
                  <th className="px-5 py-3 font-medium">Nights</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="transition hover:bg-ink-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.userName} hue={hashHue(r.userName)} size={32} />
                        <div className="leading-tight">
                          <p className="font-medium text-ink-900">{r.userName}</p>
                          <p className="text-xs text-ink-400">{r.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink-800">{r.hotelName}</p>
                      <p className="text-xs text-ink-400">{r.roomName}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-600">
                      <p>{formatDate(r.checkIn)}</p>
                      <p className="text-xs text-ink-400">→ {formatDate(r.checkOut)}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-600">{r.nights}</td>
                    <td className="px-5 py-3 font-serif text-base text-ink-900">{formatCurrency(r.total)}</td>
                    <td className="px-5 py-3"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        {r.status === 'pending' && (
                          <button
                            onClick={() => updateReservationStatus(r.id, 'confirmed')}
                            className="rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-100"
                          >
                            Confirm
                          </button>
                        )}
                        {(r.status === 'confirmed' || r.status === 'pending') && (
                          <button
                            onClick={() => updateReservationStatus(r.id, 'cancelled')}
                            className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                          >
                            Cancel
                          </button>
                        )}
                        {r.status === 'cancelled' && (
                          <span className="text-xs text-ink-300">—</span>
                        )}
                        {r.status === 'completed' && (
                          <span className="text-xs text-ink-400">Closed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-ink-400">No reservations match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function KpiCard({
  label, value, delta, up, icon, tone,
}: {
  label: string; value: string; delta: string; up?: boolean; icon: React.ReactNode; tone: 'brand' | 'teal' | 'neutral';
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    teal: 'bg-teal-50 text-teal-600',
    neutral: 'bg-ink-100 text-ink-600',
  };
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition hover:shadow-card">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tones[tone])}>{icon}</div>
        <span className={cn('inline-flex items-center gap-1 text-xs font-medium', up ? 'text-teal-600' : 'text-ink-400')}>
          {up !== undefined && (up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />)}
          {delta}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-ink-900">{value}</p>
      <p className="text-sm text-ink-400">{label}</p>
    </div>
  );
}

function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex h-52 items-end gap-2 sm:gap-3">
      {data.map((d) => {
        const h = Math.max(4, (d.revenue / max) * 100);
        return (
          <div key={d.month} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-[44px] rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-300 transition-all duration-700 group-hover:from-brand-600 group-hover:to-brand-400"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-ink-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {formatCurrency(d.revenue)}
                </div>
              </div>
            </div>
            <span className="text-[11px] text-ink-400">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- stats helpers ---------- */

interface Stats {
  totalRevenue: number;
  totalReservations: number;
  pending: number;
  avgNightly: number;
  occupancy: number;
  monthly: { month: string; revenue: number }[];
  byHotel: { id: string; name: string; location: string; revenue: number }[];
  topHotelRevenue: number;
}

function computeStats(reservations: Reservation[]): Stats {
  const active = reservations.filter((r) => r.status === 'confirmed' || r.status === 'completed');
  const totalRevenue = active.reduce((s, r) => s + r.total, 0);
  const totalNights = active.reduce((s, r) => s + r.nights, 0);
  const avgNightly = totalNights ? totalRevenue / totalNights : 0;
  const pending = reservations.filter((r) => r.status === 'pending').length;

  const totalAvailable = rooms.reduce((s, r) => s + r.available, 0);
  const totalCapacity = rooms.reduce((s, r) => s + r.total, 0);
  const occupancy = Math.round(((totalCapacity - totalAvailable) / totalCapacity) * 100);

  // Monthly revenue over the last 6 months (relative to demo "today" = 2026-07-31)
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const base = new Date('2026-07-31T00:00:00Z');
  const monthly = months.map((m, i) => {
    const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() - (5 - i), 1));
    const end = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() - (5 - i) + 1, 1));
    const revenue = active
      .filter((r) => {
        const d = new Date(r.checkIn);
        return d >= start && d < end;
      })
      .reduce((s, r) => s + r.total, 0);
    return { month: m, revenue };
  });

  const byHotel = hotels
    .map((h) => ({
      id: h.id,
      name: h.name,
      location: h.location,
      revenue: active.filter((r) => r.hotelId === h.id).reduce((s, r) => s + r.total, 0),
    }))
    .sort((a, b) => b.revenue - a.revenue);
  const topHotelRevenue = byHotel[0]?.revenue || 1;

  return {
    totalRevenue,
    totalReservations: reservations.length,
    pending,
    avgNightly,
    occupancy,
    monthly,
    byHotel,
    topHotelRevenue,
  };
}

function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}
