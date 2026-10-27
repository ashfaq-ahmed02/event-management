'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CampusEvent, EventCategory } from '@/lib/types';
import { 
  Search, Calendar, Clock, MapPin, Users, Sparkles, Filter, 
  ArrowRight 
} from 'lucide-react';

const CATEGORIES: ('All' | EventCategory)[] = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
];

export default function HomePage() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/events';
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data.events) {
        setEvents(data.data.events);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Technical': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Cultural': return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30';
      case 'Sports': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Workshop': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Seminar': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  const totalRegistered = events.reduce((sum, e) => sum + e.registered_count, 0);

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-slate-950/80 to-slate-950 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 backdrop-blur-md shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Welcome to CampusEvent Hub</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Discover, Register & Experience{' '}
            <span className="gradient-text">Unforgettable Campus Events</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Your centralized portal for hackathons, cultural festivals, tech workshops, sports championships, and career expos. Get instant digital tickets.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <div className="text-center p-2">
              <div className="text-2xl font-bold text-white">{events.length}</div>
              <div className="text-xs text-slate-400 font-medium">Active Events</div>
            </div>
            <div className="text-center p-2 border-l border-slate-800">
              <div className="text-2xl font-bold text-indigo-400">{totalRegistered}+</div>
              <div className="text-xs text-slate-400 font-medium">Registrations</div>
            </div>
            <div className="text-center p-2 border-l border-slate-800">
              <div className="text-2xl font-bold text-violet-400">5</div>
              <div className="text-xs text-slate-400 font-medium">Key Venues</div>
            </div>
            <div className="text-center p-2 border-l border-slate-800">
              <div className="text-2xl font-bold text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 font-medium">Verified Passes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event title, venue, or organizer..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {selectedCategory === 'All' ? 'All Upcoming Events' : `${selectedCategory} Events`}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {events.length} {events.length === 1 ? 'event' : 'events'} available for registration
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse p-4 space-y-4">
                <div className="h-40 rounded-xl bg-slate-800" />
                <div className="h-4 w-3/4 bg-slate-800 rounded" />
                <div className="h-3 w-1/2 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Events Found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              We couldn't find any events matching your search or category filter. Try clearing filters or search terms.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition shadow"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Event Cards Grid */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const seatsLeft = Math.max(0, event.capacity - event.registered_count);
              const percentBooked = Math.min(100, Math.round((event.registered_count / event.capacity) * 100));

              return (
                <div
                  key={event.id}
                  className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group border border-slate-800"
                >
                  {/* Event Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                    <img
                      src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md shadow-sm ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                    </div>

                    {/* Price Tag */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                        {event.price === 0 ? 'FREE ENTRY' : `$${event.price}`}
                      </span>
                    </div>

                    {/* Capacity Indicator Pill */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
                      <span className="font-medium flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        <Users className="w-3 h-3 text-indigo-400" />
                        {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Fully Booked'}
                      </span>
                      <span className="bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-sm text-slate-300">
                        {percentBooked}% booked
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="font-medium text-white">{event.date}</span>
                        <span className="text-slate-500">•</span>
                        <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    {/* Seats Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percentBooked > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                          }`}
                          style={{ width: `${percentBooked}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/events/${event.id}`}
                      className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 group-hover:gap-3"
                    >
                      <span>View Details & Register</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
