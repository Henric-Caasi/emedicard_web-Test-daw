'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Image from 'next/image';

export default function CustomUserButton() {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  // State to control the dropdown's visibility
  const [isOpen, setIsOpen] = useState(false);

  // --- Refined Dropdown Logic ---
  // A ref to the dropdown container to detect outside clicks
  const dropdownRef = useRef<HTMLDivElement>(null);

  // This effect handles closing the dropdown when the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Add the event listener when the dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener when the component unmounts or the dropdown closes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) {
    return null;
  }

  return (
    // --- The Key: A relative container ---
    // This allows us to position the dropdown absolutely *relative* to this container.
    <div className="relative" ref={dropdownRef}>
      {/* The clickable profile icon */}
      <button
        onClick={() => setIsOpen(!isOpen)} // Toggle the dropdown's visibility
        className="w-9 h-9 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        aria-label="Open user menu"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Image
          src={user.imageUrl}
          alt="User profile picture"
          width={36}
          height={30}
          className="object-cover"
        />
      </button>

      {/* --- The Refined Dropdown Menu --- */}
      {isOpen && (
        <div
          // --- Positioning and Styling ---
          // 'absolute' positions it relative to the container above.
          // 'right-0' aligns it to the right edge of the button.
          // 'mt-2' adds a small gap below the button.
          // 'w-72' gives it a comfortable width.
          // 'origin-top-right' makes the animation scale from the correct point.
          className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          {/* --- Smooth Animation --- */}
          <div className="transition-all duration-100 ease-out"
               style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)', opacity: isOpen ? 1 : 0 }}
          >
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName || user.primaryEmailAddress?.emailAddress}</p>
              <p className="text-sm text-gray-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
            <div className="py-1 border-t border-gray-100">
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Manage account
              </a>
            </div>
            <div className="py-1 border-t border-gray-100">
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="w-full text-left block px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 hover:text-red-700"
                role="menuitem"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}