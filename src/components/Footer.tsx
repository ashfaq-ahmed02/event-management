import React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-xl mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Campus<span className="text-indigo-400">Event</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The premier all-in-one college event management platform connecting students, clubs, and faculty coordinators.
            </p>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Event Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/?category=Technical" className="hover:text-indigo-400 transition">Technical & Hackathons</Link></li>
              <li><Link href="/?category=Cultural" className="hover:text-indigo-400 transition">Cultural & Music Fests</Link></li>
              <li><Link href="/?category=Sports" className="hover:text-indigo-400 transition">Sports & Tournaments</Link></li>
              <li><Link href="/?category=Workshop" className="hover:text-indigo-400 transition">Hands-on Workshops</Link></li>
              <li><Link href="/?category=Seminar" className="hover:text-indigo-400 transition">Seminars & Career Expos</Link></li>
            </ul>
          </div>

          {/* Venues & Campus */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Key Campus Venues</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> Main Auditorium</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> Open Air Amphitheatre</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> Central Sports Complex</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> Convention Pavilion</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Event Support Desk</h4>
            <p className="text-xs text-slate-400 mb-2">Need help with registration, tickets, or organizing a club event?</p>
            <div className="flex items-center gap-2 text-xs text-indigo-300">
              <Mail className="w-3.5 h-3.5" />
              <span>support@campusevent.edu</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Student Verification System</span>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} CampusEvent System. Built for academic excellence & student community.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Privacy Policy</span>
            <span className="hover:text-slate-400">Terms of Service</span>
            <span className="hover:text-slate-400">Campus Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
