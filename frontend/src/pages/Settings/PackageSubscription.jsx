import React from 'react';

const PackageSubscription = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Package & Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your subscription plan and billing</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Current Plan: Professional</h2>
            <p className="text-sm text-gray-600 mt-1">Subscription valid until: December 31, 2025</p>
          </div>
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">Active</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Users</div>
            <div className="text-2xl font-bold text-blue-600">15 / 25</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600">Locations</div>
            <div className="text-2xl font-bold text-green-600">3 / 5</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600">Products</div>
            <div className="text-2xl font-bold text-purple-600">1.2K / Unlimited</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-gray-600">Storage</div>
            <div className="text-2xl font-bold text-orange-600">45GB / 100GB</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Starter</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">$29</span>
              <span className="text-gray-600">/month</span>
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>Up to 5 users</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>1 business location</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>Up to 500 products</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>10GB storage</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>Basic reports</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">✗</span>
              <span className="text-gray-400">Advanced analytics</span>
            </li>
          </ul>
          <button className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
            Current Plan
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-4 border-teal-500 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-xs font-bold">
            CURRENT
          </div>
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Professional</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">$79</span>
              <span className="text-gray-600">/month</span>
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>Up to 25 users</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>5 business locations</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>Unlimited products</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>100GB storage</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>Advanced reports</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>Advanced analytics</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>Priority support</span>
            </li>
          </ul>
          <button className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
            Current Plan
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Enterprise</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">$199</span>
              <span className="text-gray-600">/month</span>
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>Unlimited users</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>Unlimited locations</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>Unlimited products</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>500GB storage</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>All reports & analytics</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>Custom integrations</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span>24/7 dedicated support</span>
            </li>
          </ul>
          <button className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Billing History</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-sm">Nov 01, 2025</td>
              <td className="px-6 py-4 text-sm">Professional Plan - Monthly</td>
              <td className="px-6 py-4 text-sm text-right font-semibold">$79.00</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Paid</span></td>
              <td className="px-6 py-4 text-sm"><button className="text-teal-600 hover:text-teal-900">Download</button></td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm">Oct 01, 2025</td>
              <td className="px-6 py-4 text-sm">Professional Plan - Monthly</td>
              <td className="px-6 py-4 text-sm text-right font-semibold">$79.00</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Paid</span></td>
              <td className="px-6 py-4 text-sm"><button className="text-teal-600 hover:text-teal-900">Download</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PackageSubscription;
