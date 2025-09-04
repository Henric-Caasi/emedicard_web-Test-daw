// src/app/dashboard/[id]/payment_validation/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';
import Image from 'next/image';
import CustomUserButton from '@/components/CustomUserButton';
import ApplicantActivityLog from '@/components/ApplicantActivityLog';

type ActivityLog = { timestamp: Date; adminName: string; action: string; details: string; };

export default function PaymentValidationPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const applicationId = params.id as Id<"applications">;

  // --- STATE MANAGEMENT ---
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  // --- DATA FETCHING ---
  const data = useQuery(api.payments.getForApplication.get, { applicationId });
  const validatePayment = useMutation(api.admin.validatePayment.validate);

  // --- HANDLER FUNCTIONS ---
  const addLogEntry = (action: string, details: string) => {
    const adminName = user?.fullName || 'Unknown Admin';
    const newLog: ActivityLog = { timestamp: new Date(), adminName, action, details };
    setActivityLog(prevLog => [newLog, ...prevLog]);
  };

  const handleApprove = async () => {
    if (!data) return;
    addLogEntry('Payment Approved', 'The submitted payment was approved.');
    await validatePayment({ paymentId: data.paymentId, applicationId, newStatus: "Complete" });
    // Navigate to the next step
    router.push(`/dashboard/${applicationId}/orientation-scheduler`);
  };

  const handleReject = async () => {
    if (!data) return;
    addLogEntry('Payment Rejected', 'The submitted payment was rejected.');
    await validatePayment({ paymentId: data.paymentId, applicationId, newStatus: "Failed" });
    setIsRejectModalOpen(false);
    // For now, redirect to dashboard. You can change this to a notification page.
    router.push('/dashboard');
  };

  // --- RENDER ---
  if (data === undefined) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (data === null) return <div className="min-h-screen flex items-center justify-center">Payment details not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-xl">eM</span></div>
            <span className="text-2xl font-bold text-gray-800">eMediCard</span>
          </Link>
          <div className="flex items-center gap-5">
            <ApplicantActivityLog applicantName={data.applicantName} applicationId={applicationId} />
            <CustomUserButton />
          </div>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
          <h1 className="text-3xl font-bold text-gray-800">Payment Validation</h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
          <div><label className="block text-sm font-medium text-gray-800 mb-1">Applicant name</label><input type="text" value={data.applicantName} readOnly className="w-full px-4 py-2 border rounded-md text-gray-600 bg-gray-100" /></div>
          <div><label className="block text-sm font-medium text-gray-800 mb-1">Date of Submission</label><input type="text" value={new Date(data.submissionDate).toLocaleDateString()} readOnly className="w-full px-4 py-2 border text-gray-600 rounded-md bg-gray-100" /></div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Payment Type</label>
            <div className="flex items-center w-full px-4 py-2 border rounded-md bg-gray-100">
              <input type="text" value={data.paymentMethod} readOnly className="flex-grow bg-transparent text-gray-600 border-none p-0" />
              <button onClick={() => setIsReceiptModalOpen(true)} className="text-emerald-600 underline font-semibold text-sm">View</button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={handleApprove} className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700">Approve</button>
            <button onClick={() => setIsRejectModalOpen(true)} className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700">Reject</button>
          </div>
        </div>
      </main>

      {/* --- Modals --- */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setIsReceiptModalOpen(false)}>
          <div className="relative bg-white p-2 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsReceiptModalOpen(false)} className="absolute -top-4 -right-4 z-10 bg-white text-black h-10 w-10 rounded-full flex items-center justify-center text-2xl" aria-label="Close">×</button>
            {data.receiptUrl ? (
              <Image src={data.receiptUrl} alt="Proof of Payment" width={350} height={700} className="rounded-md" />
            ) : (
              <div className="w-[350px] h-[700px] bg-gray-100 rounded-md flex items-center justify-center">
                <div className="text-center p-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m6-5l-1.5-1.5" />
                  </svg>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No Receipt</h3>
                  <p className="mt-1 text-sm text-gray-500">No receipt was submitted for this payment.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {isRejectModalOpen && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center"><div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-red-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><h2 className="text-2xl font-bold text-gray-900 mb-2">Reject Payment?</h2><p className="text-gray-600 mb-8">Are you sure you want to reject this payment?</p><div className="flex justify-center gap-4"><button onClick={() => setIsRejectModalOpen(false)} className="px-8 py-2.5 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300">Cancel</button><button onClick={handleReject} className="px-8 py-2.5 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700">Confirm Reject</button></div></div></div>)}
    </div>
  );
}
