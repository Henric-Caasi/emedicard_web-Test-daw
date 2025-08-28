// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import CustomUserButton from '@/components/CustomUserButton';
import DashboardActivityLog from '@/components/DashboardActivityLog';
import ErrorMessage from "@/components/ErrorMessage"; // Import your new error component
import { useRouter } from "next/navigation"; // Import the router for redirection

type ApplicationWithDetails = Doc<"applications"> & { userName: string; jobCategoryName: string };

export default function DashboardPage() {
  // --- 1. UI STATE ---
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | "">("");
  const router = useRouter(); // Initialize router for redirection

  // --- 2. DATA FETCHING ---
  const { isLoaded: isClerkLoaded, user } = useUser();
  const adminPrivileges = useQuery(api.users.roles.getAdminPrivileges); 
const managedJobCategories: Doc<"jobCategories">[] | undefined = useQuery(api.jobCategories.getAllJobCategories.get);
const applications = useQuery(
    api.applications.list.list,
    {
      status: statusFilter || undefined,
      jobCategory: categoryFilter === "" ? undefined : (categoryFilter as Id<"jobCategories">),
    }
  );

  // --- 3. "SMART" FILTER EFFECT ---
  useEffect(() => {
    if (adminPrivileges) {
      if (adminPrivileges.managedCategories === "all") {
        setCategoryFilter("");
        return;
      }
      if (adminPrivileges.managedCategories && adminPrivileges.managedCategories.length === 1) {
        setCategoryFilter(adminPrivileges.managedCategories[0].toString());
      }
    }
  }, [adminPrivileges]);

  // --- 4. UI LOGIC & DERIVED STATE ---
  const statusColors: Record<string, string> = {
    "Submitted": "bg-yellow-400",
    "Under Review": "bg-blue-400",
    "Approved": "bg-green-500",
    "Rejected": "bg-red-500",
    "Pending": "bg-gray-400",
    "For Document Verification": "bg-cyan-400",
    "For Payment Validation": "bg-purple-400",
    "For Orientation": "bg-indigo-400",
    "Cancelled": "bg-gray-500",
  };

  const filteredApplications = (applications ?? []).filter((app: ApplicationWithDetails) =>
    app.userName?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPending = (applications ?? []).filter((a: ApplicationWithDetails) => a.applicationStatus === 'Submitted').length;
  const totalApproved = (applications ?? []).filter((a: ApplicationWithDetails) => a.applicationStatus === 'Approved').length;
  const totalRejected = (applications ?? []).filter((a: ApplicationWithDetails) => a.applicationStatus === 'Rejected').length;
  // NEW STATS from prototype, adapted to Convex data
  const totalForDocVerification = (applications ?? []).filter((a: ApplicationWithDetails) => a.applicationStatus === 'For Document Verification').length;
  const totalForPaymentValidation = (applications ?? []).filter((a: ApplicationWithDetails) => a.applicationStatus === 'For Payment Validation').length;
  const totalForOrientation = (applications ?? []).filter((a: ApplicationWithDetails) => a.applicationStatus === 'For Orientation').length;


  // --- 5. LOADING & GUARD CLAUSES ---
  if (!isClerkLoaded || adminPrivileges === undefined || managedJobCategories === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  
  if (!adminPrivileges.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage
          title="Access Denied"
          message="You do not have the necessary privileges to view the admin dashboard."
          onCloseAction={() => router.push('/')} // Redirect to home page on close
        />
      </div>
    );
  }

  // --- 6. RENDER THE DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md w-full sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-xl">eM</span></div>
            <span className="text-2xl font-bold text-gray-800">eMediCard</span>
          </div>
          
          {/* Group for all the icons on the right */}
          <div className="flex items-center gap-5">
            <Link href="/dashboard/notification-management" className="text-gray-500 hover:text-emerald-600" title="Manage Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </Link>
            
            {/* Activity Log dropdown */}
            <DashboardActivityLog />

            <CustomUserButton />
          </div>
        </div>
      </nav>
      
      <main className="max-w-6xl mx-auto py-10 px-4">
        {/* Stats Row - Merged from prototype and existing */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
          <div className="bg-white border rounded-lg p-4 text-center"><div className="text-xl text-black font-bold">{totalPending}</div><div className="text-xs text-gray-500">Total Pending</div></div>
          <div className="bg-white border rounded-lg p-4 text-center"><div className="text-xl text-black font-bold">{totalForDocVerification}</div><div className="text-xs text-gray-500">For Document Verification</div></div>
          <div className="bg-white border rounded-lg p-4 text-center"><div className="text-xl text-black font-bold">{totalForPaymentValidation}</div><div className="text-xs text-gray-500">For Payment Validation</div></div>
          <div className="bg-white border rounded-lg p-4 text-center"><div className="text-xl text-black font-bold">{totalForOrientation}</div><div className="text-xs text-gray-500">For Orientation</div></div>
          <div className="bg-white border rounded-lg p-4 text-center"><div className="text-xl text-black font-bold">{totalApproved}</div><div className="text-xs text-gray-500">Approved</div></div>
        </div>

        {/* Controls Row - Merged from prototype and existing */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div className="flex gap-4 flex-col sm:flex-row">
            {/* Category Filter (from existing) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Category</label>
              <select 
                className="px-4 py-2 pr-10 border border-gray-300 text-black rounded-lg shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                value={categoryFilter} 
                onChange={e => setCategoryFilter(e.target.value)}
                disabled={managedJobCategories === undefined}
              >
                {adminPrivileges.managedCategories === "all" && <option value="">All Categories</option>}
                {managedJobCategories?.map((cat: Doc<"jobCategories">) => ( <option key={cat._id} value={cat._id.toString()}>{cat.name}</option>
                ))}
              </select>
            </div>
            {/* Status Filter (from existing, with prototype styling) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Status</label>
              <select className="px-4 py-2 pr-10 border border-gray-300 text-black rounded-lg shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Pending">Pending</option>
                <option value="For Document Verification">Document Verification</option>
                <option value="For Payment Validation">Payment Validation</option>
                <option value="For Orientation">Orientation</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex items-end gap-4">
            {/* Attendance Tracker Link (from prototype, conditional on category) */}
            {adminPrivileges.managedCategories !== "all" && managedJobCategories?.some(cat => cat.name === "Food Handler") && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 invisible md:visible"> </label>
                <Link href="/dashboard/attendance-tracker" className="flex items-center justify-center bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap">Track Attendance</Link>
              </div>
            )}
            {/* Search Input (from existing, with prototype styling) */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-1 invisible md:visible"> </label>
              <input type="text" placeholder="Search Applicants" className="px-4 py-2 border border-gray-300 text-black rounded-lg" value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 220 }} />
            </div>
          </div>
        </div>
        
        {/* Table with Live Data */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-700">Applicant Name</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">Job Category</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">Submission Date</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Improved loading and empty state */}
              {applications === undefined && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading applicants...</td></tr>
              )}
              {applications && filteredApplications.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No applicants found.</td></tr>
              )}
              {applications && filteredApplications.map((app: ApplicationWithDetails) => (
                <tr key={app._id} className="border-b last:border-none hover:bg-gray-50">
                  <td className="px-6 text-black py-4">{app.userName}</td>
                  <td className="px-6 text-black py-4">{app.jobCategoryName}</td>
                  <td className="px-6 text-black py-4">{new Date(app._creationTime).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-white px-3 py-1 rounded-full text-xs font-semibold ${statusColors[app.applicationStatus] || 'bg-gray-400'}`}>
                      {app.applicationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/${app._id}/doc_verif`} className="text-emerald-600 underline font-semibold hover:text-emerald-800 text-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
