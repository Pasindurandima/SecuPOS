import React from 'react';

export default function DashboardCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow flex items-center gap-4">
      <div className="w-12 h-12 bg-emerald-400 rounded-md" />
      <div>
        <div className="text-xs font-bold text-gray-500">{title}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}
