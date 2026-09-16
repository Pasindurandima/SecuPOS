import React from 'react';
import { FaUserTie, FaCalendarAlt, FaMoneyBillWave, FaClock } from 'react-icons/fa';

const HRM = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Human Resource Management</h1>
        <p className="text-gray-600 mt-2">Manage employees, attendance, payroll, and leave requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Employees</p>
              <h3 className="text-3xl font-bold mt-2">48</h3>
              <p className="text-xs mt-2 opacity-75">3 new this month</p>
            </div>
            <FaUserTie className="text-5xl opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Present Today</p>
              <h3 className="text-3xl font-bold mt-2">42</h3>
              <p className="text-xs mt-2 opacity-75">87.5% attendance</p>
            </div>
            <FaCalendarAlt className="text-5xl opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Payroll This Month</p>
              <h3 className="text-3xl font-bold mt-2">$95K</h3>
              <p className="text-xs mt-2 opacity-75">Processing in 5 days</p>
            </div>
            <FaMoneyBillWave className="text-5xl opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending Leaves</p>
              <h3 className="text-3xl font-bold mt-2">8</h3>
              <p className="text-xs mt-2 opacity-75">Requires approval</p>
            </div>
            <FaClock className="text-5xl opacity-30" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Employee Directory</h2>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              + Add Employee
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  JD
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">John Doe</h3>
                  <p className="text-xs text-gray-500">Sales Manager</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                <p className="text-xs text-gray-500 mt-1">EMP-001</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  AS
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Alice Smith</h3>
                  <p className="text-xs text-gray-500">HR Specialist</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                <p className="text-xs text-gray-500 mt-1">EMP-002</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  MB
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Michael Brown</h3>
                  <p className="text-xs text-gray-500">Accountant</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                <p className="text-xs text-gray-500 mt-1">EMP-003</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                  EJ
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Emily Johnson</h3>
                  <p className="text-xs text-gray-500">Store Manager</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">On Leave</span>
                <p className="text-xs text-gray-500 mt-1">EMP-004</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 text-teal-600 hover:text-teal-800 text-sm font-medium">
            View All Employees →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Pending Leave Requests</h2>
            <button className="text-teal-600 hover:text-teal-800 text-sm">View All</button>
          </div>
          <div className="space-y-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">Sarah Williams</h3>
                  <p className="text-xs text-gray-500">Marketing Executive</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Pending</span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                <p><strong>Type:</strong> Sick Leave</p>
                <p><strong>Duration:</strong> Nov 10 - Nov 12 (3 days)</p>
                <p><strong>Reason:</strong> Medical appointment</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                  Approve
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                  Reject
                </button>
              </div>
            </div>

            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">David Miller</h3>
                  <p className="text-xs text-gray-500">IT Support</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Pending</span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                <p><strong>Type:</strong> Annual Leave</p>
                <p><strong>Duration:</strong> Nov 20 - Nov 25 (5 days)</p>
                <p><strong>Reason:</strong> Family vacation</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                  Approve
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Attendance</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 border-l-4 border-green-500 bg-green-50">
              <span className="text-sm font-medium">Present</span>
              <span className="text-lg font-bold text-green-600">42</span>
            </div>
            <div className="flex justify-between items-center p-2 border-l-4 border-red-500 bg-red-50">
              <span className="text-sm font-medium">Absent</span>
              <span className="text-lg font-bold text-red-600">3</span>
            </div>
            <div className="flex justify-between items-center p-2 border-l-4 border-yellow-500 bg-yellow-50">
              <span className="text-sm font-medium">On Leave</span>
              <span className="text-lg font-bold text-yellow-600">3</span>
            </div>
            <div className="flex justify-between items-center p-2 border-l-4 border-blue-500 bg-blue-50">
              <span className="text-sm font-medium">Late Arrival</span>
              <span className="text-lg font-bold text-blue-600">5</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors">
            Mark Attendance
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
              <h3 className="font-semibold text-gray-900">Payroll Processing</h3>
              <p className="text-xs text-gray-600 mt-1">November 10, 2025</p>
            </div>
            <div className="p-3 border-l-4 border-purple-500 bg-purple-50 rounded">
              <h3 className="font-semibold text-gray-900">Team Meeting</h3>
              <p className="text-xs text-gray-600 mt-1">November 8, 2025 - 2:00 PM</p>
            </div>
            <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded">
              <h3 className="font-semibold text-gray-900">Performance Review</h3>
              <p className="text-xs text-gray-600 mt-1">November 15-20, 2025</p>
            </div>
            <div className="p-3 border-l-4 border-orange-500 bg-orange-50 rounded">
              <h3 className="font-semibold text-gray-900">Training Workshop</h3>
              <p className="text-xs text-gray-600 mt-1">November 25, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRM;
