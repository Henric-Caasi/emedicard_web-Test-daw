'use client';

import React, { useState, useEffect, useRef } from 'react';

// Define the structure for a single log entry
type ActivityLog = {
  timestamp: Date;
  adminName: string;
  action: string;
  details: string;
};

// Define the props the component will accept
interface ApplicantActivityLogProps {
  applicantName: string;
  activityLog: ActivityLog[];
}

// Helper to format time nicely (e.g., "1 hour ago")
const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

export default function ApplicantActivityLog({ applicantName, activityLog }: ApplicantActivityLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Logic to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The clickable history icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-emerald-600"
        title={`View activity for ${applicantName}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </button>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Activity History</h3>
            <p className="text-sm text-gray-500 truncate">For: <span className="font-medium">{applicantName}</span></p>
          </div>
          <div className="py-2 max-h-96 overflow-y-auto">
            {activityLog.length > 0 ? (
              activityLog.map((log, index) => (
                <div key={index} className="px-4 py-3 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-800">{log.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {timeAgo(log.timestamp)} by <span className="font-semibold">{log.adminName}</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500 py-4 px-4">No activity recorded for this applicant yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}