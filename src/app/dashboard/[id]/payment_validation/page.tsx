'use client';

import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

type PageProps = {
  params: {
    id: Id<'forms'>;
  };
};

export default function PaymentValidationPage({ params }: PageProps) {
  const form = useQuery(api.forms.get, { id: params.id });
  const payment = useQuery(api.payments.getByForm, { formId: params.id });
  const updatePaymentStatus = useMutation(api.payments.updateStatus);

  const handleUpdateStatus = (status: 'Complete' | 'Failed') => {
    if (payment) {
      updatePaymentStatus({ paymentId: payment._id, status });
    }
  };

  if (!form || !payment) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Validation</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">{form.userName}</h2>
        <p className="text-gray-600 mb-4">{form.jobCategoryName}</p>
        <div className="border-t pt-4">
          <p><span className="font-semibold">Amount:</span> {payment.amount}</p>
          <p><span className="font-semibold">Method:</span> {payment.method}</p>
          <p><span className="font-semibold">Reference:</span> {payment.referenceNumber}</p>
          <p><span className="font-semibold">Status:</span> {payment.status}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleUpdateStatus('Complete')}
              className="bg-green-500 text-white px-3 py-1 rounded-lg"
            >
              Approve
            </button>
            <button
              onClick={() => handleUpdateStatus('Failed')}
              className="bg-red-500 text-white px-3 py-1 rounded-lg"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
