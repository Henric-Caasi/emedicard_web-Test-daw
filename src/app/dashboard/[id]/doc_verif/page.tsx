// src/app/dashboard/[id]/doc_verif/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs'; // Import useUser for admin name in logs
import CustomUserButton from '@/components/CustomUserButton';
import ApplicantActivityLog from '@/components/ApplicantActivityLog';
// NEW: Import your beautiful new ErrorMessage component
import ErrorMessage from '@/components/ErrorMessage';

// --- Data Structures ---
interface AppError { title: string; message: string; }
const createAppError = (message: string, title: string = 'Invalid Input'): AppError => ({ title, message });
type ActivityLog = { timestamp: Date; adminName: string; action: string; details: string; };
const remarkOptions = [ 'Invalid Government-issued ID', 'Missing Documents Request', 'Unclear Drug Test Results', 'Medical Follow-up Required', 'Others' ];

type PageProps = { params: Promise<{ id: Id<'applications'> }> };

export default function DocumentVerificationPage({ params: paramsPromise }: PageProps) {
  const params = React.use(paramsPromise);
  const { user } = useUser(); // For activity log admin name
  // --- STATE MANAGEMENT ---
  const [viewModalDocUrl, setViewModalDocUrl] = useState<string | null>(null);
  // NEW: State for error messages, connected to your component
  const [error, setError] = useState<AppError | null>(null); // Use AppError type
  const [openRemarkIndex, setOpenRemarkIndex] = useState<number | null>(null);
  const [selectedRemark, setSelectedRemark] = useState<string>('');
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]); // For activity log
  const router = useRouter();

  // --- DATA FETCHING ---
  const data = useQuery(api.applications.getWithDocuments.get, { id: params.id });
  const reviewDocument = useMutation(api.admin.reviewDocument.review);
  const finalizeApplication = useMutation(api.admin.finalizeApplication.finalize);

  // --- HANDLER FUNCTIONS ---
  const addLogEntry = (action: string, details: string) => {
    const adminName = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Unknown Admin';
    const newLog: ActivityLog = { timestamp: new Date(), adminName, action, details };
    setActivityLog(prevLog => [newLog, ...prevLog]);
  };

  const handleStatusChange = async (index: number, uploadId: Id<'documentUploads'>, newStatus: 'Approved' | 'Rejected') => {
    setError(null); // Clear any previous errors when the user takes an action
    if (newStatus === 'Rejected') {
      setSelectedRemark(data?.checklist[index].remarks || ''); // Pre-fill if remark exists
      setOpenRemarkIndex(index);
    } else {
      setOpenRemarkIndex(null); // Close remark card if approved
      await reviewDocument({ documentUploadId: uploadId, status: newStatus, remarks: "" });
      addLogEntry('Document Approved', `Set status of "${data?.checklist[index].requirementName}" to Approved.`);
    }
  };

  const handleFinalize = async (newStatus: 'Approved' | 'Rejected') => {
    try {
      setError(null); // Clear previous errors
      // This is the validation logic from your prototype, now connected to real data!
      const pendingDocs = data?.checklist.filter(doc => doc.status === 'Missing' || doc.status === 'Pending');
      if (pendingDocs && pendingDocs.length > 0) {
        throw new Error("Please review and assign a status (Approve or Reject) to all documents before proceeding.");
      }
      if (newStatus === 'Rejected' && !data?.checklist.some(doc => doc.status === 'Rejected')) {
        throw new Error("To reject the application, at least one document must be marked as 'Rejected'.");
      }

      await finalizeApplication({ applicationId: params.id, newStatus });
      alert(`Application has been successfully ${newStatus.toLowerCase()}.`);
      router.push('/dashboard');
    } catch (e: any) {
      // This is where we "turn on the warning light"
      setError({ title: "Validation Failed", message: e.message });
    }
  };

  // --- RENDER ---
  if (data === undefined) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (data === null) return <div className="min-h-screen flex items-center justify-center">Application not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- REVISED Navbar with Activity Log --- */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-xl">eM</span></div>
            <span className="text-2xl font-bold text-gray-800">eMediCard</span>
          </Link>
          <div className="flex items-center gap-5">
            <ApplicantActivityLog applicantName={data.applicantName} activityLog={activityLog} />
            <CustomUserButton />
          </div>
        </div>
      </nav>
      {/* --- Main Content Area --- */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800" aria-label="Go back"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
          <h1 className="text-3xl font-bold text-gray-800">Document Verification</h1>
        </div>

        <div className="bg-white p-6 rounded-lg text-gray-800 shadow space-y-6">
          <div className="border-b pb-4">
            <p>Applicant: <span className="font-semibold">{data.applicantName}</span></p>
            <p>Category: <span className="font-semibold">{data.jobCategoryName}</span></p>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Documents Upload</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 text-sm border-b">
                  <th className="py-2 pr-4">Document</th>
                  <th className="py-2 px-2 text-center">View</th>
                  <th className="py-2 px-2 text-center">Approve</th>
                  <th className="py-2 px-2 text-center">Reject</th>
                  <th className="py-2 pl-2 text-center">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {data.checklist.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="border-b last:border-none text-gray-700">
                      <td className="py-3 pr-4 font-medium">{item.requirementName}{item.isRequired && <span className="text-red-500 ml-1">*</span>}</td>
                      <td className="py-3 px-2 text-center">
                        {item.fileUrl ? (
                          <button onClick={() => setViewModalDocUrl(item.fileUrl)} className="text-emerald-600 underline font-semibold hover:text-emerald-800 text-sm">View</button>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <label className={`inline-flex items-center cursor-pointer ${item.status === 'Approved' ? 'text-green-600 font-semibold' : ''}`}>
                          <input type="radio" name={`doc-${idx}`} checked={item.status === 'Approved'} onChange={() => item.uploadId && handleStatusChange(idx, item.uploadId, 'Approved')} disabled={!item.uploadId} className="form-radio h-4 w-4 text-green-600" />
                          <span className="ml-2"></span>
                        </label>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <label className={`inline-flex items-center cursor-pointer ${item.status === 'Rejected' ? 'text-red-600 font-semibold' : ''}`}>
                          <input type="radio" name={`doc-${idx}`} checked={item.status === 'Rejected'} onChange={() => item.uploadId && handleStatusChange(idx, item.uploadId, 'Rejected')} disabled={!item.uploadId} className="form-radio h-4 w-4 text-red-600" />
                          <span className="ml-2"></span>
                        </label>
                      </td>
                      <td className="py-3 pl-2 text-center">
                        <button onClick={() => setOpenRemarkIndex(openRemarkIndex === idx ? null : idx)} disabled={item.status !== 'Rejected'} className="text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:text-blue-600" aria-label="Add remark">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        </button>
                      </td>
                    </tr>
                    {openRemarkIndex === idx && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="p-4">
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Select a Remark for "{item.requirementName}"</h4>
                            <div className="space-y-2">
                              {remarkOptions.map(option => (
                                <label key={option} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                  <input type="radio" name={`remark-${idx}`} value={option} checked={selectedRemark === option} onChange={(e) => setSelectedRemark(e.target.value)} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500" />
                                  <span className="ml-3 text-sm text-gray-700">{option}</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                              <button onClick={() => setOpenRemarkIndex(null)} className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded-md text-sm hover:bg-gray-300">Cancel</button>
                              <button onClick={async () => {
                                try {
                                  if (!selectedRemark) throw new Error("Please select a remark before saving.");
                                  await reviewDocument({ documentUploadId: item.uploadId!, status: 'Rejected', remarks: selectedRemark });
                                  addLogEntry('Remark Saved', `Added remark "${selectedRemark}" to document "${item.requirementName}".`);
                                  setOpenRemarkIndex(null);
                                  setError(null);
                                } catch (e: any) {
                                  setError(createAppError(e.message, 'Validation Error'));
                                }
                              }} className="bg-emerald-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-emerald-700">Save Remark</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {/* This is where the warning light gets rendered! */}
          {error && (
            <div className="pt-4">
              <ErrorMessage 
                title={error.title} 
                message={error.message} 
                onCloseAction={() => setError(null)} // The "wire" to turn the light off
              />
            </div>
          )}
          <div className="flex justify-end gap-4 mt-6">
            <button onClick={() => handleFinalize('Approved')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">Approve & Continue</button>
            <button onClick={() => handleFinalize('Rejected')} className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700">Reject Application</button>
          </div>
        </div>
      </main>
      {/* The View Document Modal */}
      {viewModalDocUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setViewModalDocUrl(null)}>
          <div className="relative bg-white p-4 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Document Preview</h3>
            <div className="w-full h-[calc(100%-80px)] bg-gray-200 rounded-md">
              {viewModalDocUrl.endsWith('.pdf') ? (
                <iframe src={viewModalDocUrl} className="w-full h-full" title="Document Preview"></iframe>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={viewModalDocUrl} alt="Document Preview" className="w-full h-full object-contain" />
              )}
            </div>
            <button onClick={() => setViewModalDocUrl(null)} className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
