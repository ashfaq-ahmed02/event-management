'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Registration } from '@/lib/types';
import { 
  Ticket, Calendar, MapPin, Trash2, ArrowRight, CheckCircle2 
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const fetchMyRegistrations = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/registrations/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data.registrations) {
        setRegistrations(data.data.registrations);
      }
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchMyRegistrations();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const handleCancelRegistration = async (eventId: number, regId: number) => {
    if (!confirm('Are you sure you want to cancel this event pass? Your seat will be released.')) {
      return;
    }

    try {
      setCancellingId(regId);
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setRegistrations((prev) => prev.filter((r) => r.id !== regId));
      } else {
        alert('Failed to cancel pass. Please try again.');
      }
    } catch (err) {
      alert('Network error. Could not cancel pass.');
    } finally {
      setCancellingId(null);
    }
  };

  if (!user && !loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
        <p className="text-sm text-slate-400 mb-6">
          Please sign in to view your registered event tickets and passes.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          Sign In Now
        </button>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode="login"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Student Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-indigo-600/30">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {user?.department} • {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
            <div className="text-lg font-bold text-white">{registrations.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Passes</div>
          </div>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <span>Find Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Passes List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-400" />
              <span>My Event Passes</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Show your digital ticket code at the entrance desk for event check-in.
            </p>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && registrations.length === 0 && (
          <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Event Passes Yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
              You haven't registered for any events yet. Check out the latest campus hackathons, fests, and workshops!
            </p>
            <Link
              href="/"
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition"
            >
              Explore Upcoming Events
            </Link>
          </div>
        )}

        {/* Digital Ticket Cards Grid */}
        {!loading && registrations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="relative rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
              >
                {/* Header Ticket Banner */}
                <div className="p-5 border-b border-dashed border-slate-800 flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase mb-2">
                      {reg.event_category}
                    </span>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {reg.event_title}
                    </h3>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">Ticket Code</span>
                    <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 bg-indigo-950/60 rounded border border-indigo-800/50">
                      {reg.ticket_code}
                    </span>
                  </div>
                </div>

                {/* Middle Ticket Details */}
                <div className="p-5 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Schedule</span>
                    <div className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{reg.event_date}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5 pl-5">{reg.event_time}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Campus Location</span>
                    <div className="font-semibold text-white mt-0.5 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                      <span className="truncate">{reg.event_venue}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated QR Code / Barcode Footer */}
                <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Pass</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/events/${reg.event_id}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleCancelRegistration(reg.event_id, reg.id)}
                      disabled={cancellingId === reg.id}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{cancellingId === reg.id ? 'Cancelling...' : 'Cancel'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
