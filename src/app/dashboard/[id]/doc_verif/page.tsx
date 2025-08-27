// src/app/dashboard/[id]/doc_verif/page.tsx
'use client';

import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api'; // Use the clean path alias
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';

type PageProps = {
  params: {
    id: Id<'forms'>;
  };
};

export default function DocumentVerificationPage({ params }: PageProps) {
  // --- 1. CORRECT DATA FETCHING ---
  // These paths now match your professional file structure.
  const form = useQuery(api.forms.getFormById.getFormByIdQuery, { formId: params.id });
  const formDocuments = useQuery(api.requirements.getFormDocumentsRequirements.getFormDocumentsRequirementsQuery, { formId: params.id });
  const verifyDocument = useMutation(api.requirements.adminReviewDocument.adminReviewDocumentMutation);

  const handleVerify = (documentId: Id<'formDocuments'>, status: 'Approved' | 'Rejected') => {
    // You can add a text input for remarks later
    verifyDocument({ documentId, status, remarks: "Document has been reviewed." });
  };

  const applicantUser = useQuery(api.users.getUserById.getUserById, formDocuments?.form.userId ? { userId: formDocuments.form.userId } : 'skip');

  // --- 2. LOADING & GUARD CLAUSES ---
  // A more robust loading state
  if (form === undefined || formDocuments === undefined || applicantUser === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Loading Document Details...</div>
      </div>
    );
  }

  // Handle case where the form doesn't exist
  if (form === null || applicantUser === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-red-600">Form or Applicant not found.</div>
      </div>
    );
  }

  // --- 3. RENDER THE POLISHED UI ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-emerald-600 hover:underline font-semibold">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="border-b pb-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Document Verification</h1>
            <p className="text-lg text-gray-600 mt-1">
              Applicant: <span className="font-semibold">{applicantUser.username}</span>
            </p>
            <p className="text-md text-gray-500">
              Category: <span className="font-semibold">{formDocuments.jobCategory.name}</span>
            </p>
          </div>
          
          <div className="space-y-4">
            {formDocuments.uploadedDocuments.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No documents have been uploaded for this application.</p>
            ) : (
              formDocuments.uploadedDocuments.map((doc) => (
                <div key={doc._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mb-3 sm:mb-0">
                    {/* This link now uses the URL we fetched in the main query - much faster! */}
                    <a 
                      href={doc.fileUrl ?? '#'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-semibold text-emerald-700 hover:underline"
                    >
                      {doc.documentName}
                    </a>
                    <p className="text-sm text-gray-500">
                      Status: <span className="font-medium">{doc.status}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {/* These buttons now use your emerald theme and have disabled states */}
                    <button
                      onClick={() => handleVerify(doc._id, 'Approved')}
                      className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      disabled={doc.status === 'Approved'}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(doc._id, 'Rejected')}
                      className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      disabled={doc.status === 'Rejected'}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
