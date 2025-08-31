import React from 'react';

interface ActivityLog {
  timestamp: Date;
  adminName: string;
  action: string;
  details: string;
}

interface ApplicantActivityLogProps {
  applicantName: string;
  activityLog: ActivityLog[];
}

const ApplicantActivityLog: React.FC<ApplicantActivityLogProps> = ({ applicantName, activityLog }) => {
  return (
    <div className="relative">
      {/* Placeholder for activity log button */}
      <button className="text-gray-600 hover:text-gray-800">Activity Log</button>
      {/* You can add a modal or dropdown here to display the log */}
    </div>
  );
};

export default ApplicantActivityLog;
