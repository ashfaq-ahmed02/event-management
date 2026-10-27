'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CampusEvent, Registration } from '@/lib/types';
import { 
  Calendar, MapPin, Ticket, ArrowLeft, 
  CheckCircle, Shield, AlertCircle 
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function EventDetailPage() {
  const params = useParams();
  const { user, token } = useAuth();
  const eventId = params.id as string;

  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const fetchEventData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.data.event) {
        setEvent(data.data.event);
        setIsRegistered(data.data.isRegistered);
        setRegistration(data.data.registration || null);
      }
    } catch (err) {
      console.error('Failed to load event:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId, fetchEventData]);

  const handleRegister = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setRegistering(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsRegistered(true);
        setRegistration(data.data.registration);
        setMessage({ text: data.message || 'Registration successful!', type: 'success' });
        // Refresh event to get updated capacity
        fetchEventData();
      } else {
        setMessage({ text: data.error || 'Registration failed', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Network error', type: 'error' });
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!confirm('Are you sure you want to cancel your registration? Your seat will be made available to other students.')) {
      return;
    }

    setCancelling(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsRegistered(false);
        setRegistration(null);
        setMessage({ text: 'Registration cancelled. Seat released.', type: 'success' });
        fetchEventData();
      } else {
        setMessage({ text: data.error || 'Cancellation failed', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Network error', type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">The requested campus event may have been removed or does not exist.</p>
        <Link href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Back to Events
        </Link>
      </div>
    );
  }

  const seatsLeft = Math.max(0, event.capacity - event.registered_count);
  const percentBooked = Math.min(100, Math.round((event.registered_count / event.capacity) * 100));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Catalog</span>
      </Link>

      {/* Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl mb-8">
        <div className="relative h-64 sm:h-96 w-full">
          <img
            src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Badges in header */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600/90 text-white backdrop-blur-md shadow-md">
              {event.category}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-900/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              {event.price === 0 ? 'FREE ADMISSION' : `$${event.price}`}
            </span>
          </div>

          {/* Title on Banner */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-300 font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" /> Organized by: {event.organizer}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Registration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Event Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Schedule & Venue Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Date & Time</div>
                <div className="text-sm font-bold text-white mt-0.5">{event.date}</div>
                <div className="text-xs text-indigo-300 font-medium">{event.time}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Location / Venue</div>
                <div className="text-sm font-bold text-white mt-0.5">{event.venue}</div>
                <div className="text-xs text-slate-400">Campus Central Zone</div>
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">About This Event</h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Event Guidelines</h3>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li>Please bring your digital ticket pass (QR / Ticket Code) for check-in at the entrance.</li>
                <li>Valid student or faculty ID required for verification.</li>
                <li>Digital certificate of participation issued within 48 hours of event completion.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-5 sticky top-24 backdrop-blur-xl">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-between">
              <span>Event Registration</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                seatsLeft > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {seatsLeft > 0 ? `${seatsLeft} Seats Left` : 'Sold Out'}
              </span>
            </h3>

            {/* Capacity tracker */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Registrations: {event.registered_count}</span>
                <span>Total Capacity: {event.capacity}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                  style={{ width: `${percentBooked}%` }}
                />
              </div>
            </div>

            {/* Feedback Message */}
            {message && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Registration State Actions */}
            {isRegistered ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-emerald-300">You are Registered!</div>
                  <div className="text-xs text-slate-300">
                    Your digital pass is confirmed.
                  </div>
                  {registration && (
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Ticket Code</span>
                      <span className="inline-block px-3 py-1 bg-slate-900 border border-emerald-500/50 rounded-lg text-emerald-300 font-mono font-bold text-xs tracking-wider">
                        {registration.ticket_code}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href="/dashboard"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-2 transition"
                >
                  <Ticket className="w-4 h-4" />
                  <span>View in My Passes</span>
                </Link>

                <button
                  onClick={handleCancelRegistration}
                  disabled={cancelling}
                  className="w-full py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Registration'}
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleRegister}
                  disabled={registering || seatsLeft <= 0}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {registering ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : seatsLeft <= 0 ? (
                    'Event Fully Booked'
                  ) : !user ? (
                    'Sign In to Register'
                  ) : (
                    'Register for Event'
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-normal">
                  Instant confirmation. You can view or cancel your digital ticket anytime in your dashboard.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>
  );
}
