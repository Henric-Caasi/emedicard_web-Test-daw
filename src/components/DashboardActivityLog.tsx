'use client';

import React, { useState, useEffect, useRef } from 'react';

// --- Dummy Data for the Audit Log ---
// In a real app, this data would be fetched from your backend.
const recentActivities = [
  {
    id: 1,
    adminName: 'Rogel Henric',
    applicantName: 'Maria Clara',
    action: 'Approved Application',
    timestamp: new Date(Date.now() - 3600 * 1000 * 1), // 1 hour ago
  },
  {
    id: 2,
    adminName: 'rokuzen26@emedicard.com',
    applicantName: 'Sean Maynard',
    action: 'Rejected Document',
    timestamp: new Date(Date.now() - 3600 * 1000 * 3), // 3 hours ago
  },
  {
    id: 3,
    adminName: 'Rogel Henric',
    applicantName: 'KenKen Gwapo',
    action: 'Scheduled Orientation',
    timestamp: new Date(Date.now() - 3600 * 1000 * 8), // 8 hours ago
  },
];

// Helper to format time nicely (e.g., "1 hour ago")
const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

export default function DashboardActivityLog() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Logic to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The clickable history icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-emerald-600"
        title="View Recent Activity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </button>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Admin Activity</h3>
            <p className="text-sm text-gray-500">A log of recent verifications.</p>
          </div>
          <div className="py-2 max-h-96 overflow-y-auto">
            {recentActivities.map(activity => (
              <div key={activity.id} className="px-4 py-3 hover:bg-gray-50">
                <p className="text-sm font-medium text-gray-800">
                  <span className="font-bold">{activity.adminName}</span> {activity.action.toLowerCase()} for <span className="font-bold">{activity.applicantName}</span>.
                </p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(activity.timestamp)}</p>
              </div>
            ))}
          </div>
          <div className="p-2 bg-gray-50 rounded-b-xl">
            <a href="#" className="block text-center text-sm text-emerald-600 font-semibold hover:underline">
              View all activity
            </a>
          </div>
        </div>
      )}
    </div>
  );
}