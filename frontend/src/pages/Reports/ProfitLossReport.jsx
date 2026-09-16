import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportService } from '../../services/apiService';
import { formatCurrency } from '../../context/BusinessSettingsContext';

const ProfitLossReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getProfitLossReport(
        `${startDate}T00:00:00`,
        `${endDate}T23:59:59`
      );
      setReportData(data);
    } catch (err) {
      console.error('Error fetching profit/loss report:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const content = `PROFIT & LOSS REPORT\n\nPeriod: ${startDate} to ${endDate}\n\nREVENUE\nTotal Revenue: ${formatCurrency(reportData.totalRevenue)}\n\nCOST OF GOODS SOLD\nTotal COGS: ${formatCurrency(reportData.totalCOGS)}\n\nGross Profit: ${formatCurrency(reportData.grossProfit)}\n\nOPERATING EXPENSES\nTotal Operating Expenses: ${formatCurrency(reportData.totalOperatingExpenses)}\n\nNET PROFIT: ${formatCurrency(reportData.netProfit)}\nProfit Margin: ${reportData.profitMargin.toFixed(2)}%`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-loss-report-${new Date().getTime()}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profit & Loss Report</h1>
        <p className="text-gray-600 mt-2">Comprehensive income statement and profitability analysis</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" 
            />
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" 
            />
            <button 
              onClick={fetchReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Filter
            </button>
          </div>
          <button 
            onClick={handleExport}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <div className="text-sm opacity-90 mb-2">Total Revenue</div>
          <div className="text-3xl font-bold">{formatCurrency(reportData.totalRevenue)}</div>
          <div className="text-xs opacity-75 mt-2">From sales</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-md">
          <div className="text-sm opacity-90 mb-2">Total Expenses</div>
          <div className="text-3xl font-bold">{formatCurrency(Number(reportData.totalCOGS || 0) + Number(reportData.totalOperatingExpenses || 0))}</div>
          <div className="text-xs opacity-75 mt-2">COGS + Operating</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <div className="text-sm opacity-90 mb-2">Net Profit</div>
          <div className="text-3xl font-bold">{formatCurrency(reportData.netProfit)}</div>
          <div className="text-xs opacity-75 mt-2">Margin: {reportData.profitMargin.toFixed(2)}%</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Profit Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportData.monthlyData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
            <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Detailed Statement</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-teal-600 mb-2">REVENUE</h3>
            <div className="ml-4 space-y-1">
              <div className="flex justify-between text-sm"><span>Sales Revenue</span><span className="font-medium">{formatCurrency(reportData.totalRevenue)}</span></div>
              <div className="flex justify-between font-semibold border-t pt-2"><span>Total Revenue</span><span className="text-blue-600">{formatCurrency(reportData.totalRevenue)}</span></div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-teal-600 mb-2">COST OF GOODS SOLD</h3>
            <div className="ml-4 space-y-1">
              <div className="flex justify-between text-sm"><span>Total Purchases</span><span className="font-medium">{formatCurrency(reportData.totalCOGS)}</span></div>
              <div className="flex justify-between font-semibold border-t pt-2"><span>Total COGS</span><span className="text-red-600">{formatCurrency(reportData.totalCOGS)}</span></div>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <div className="flex justify-between font-bold"><span>GROSS PROFIT</span><span className="text-blue-600">{formatCurrency(reportData.grossProfit)}</span></div>
          </div>
          <div>
            <h3 className="font-semibold text-teal-600 mb-2">OPERATING EXPENSES</h3>
            <div className="ml-4 space-y-1">
              {reportData.expenseBreakdown && Object.keys(reportData.expenseBreakdown).length > 0 ? (
                Object.entries(reportData.expenseBreakdown).map(([category, amount]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span>{category.charAt(0) + category.slice(1).toLowerCase()}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No expense breakdown available</div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2"><span>Total Operating Expenses</span><span className="text-red-600">{formatCurrency(reportData.totalOperatingExpenses)}</span></div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <div className="flex justify-between text-lg font-bold"><span>NET PROFIT</span><span className={`${parseFloat(reportData.netProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(reportData.netProfit)}</span></div>
            <div className="text-sm text-gray-600 mt-1">Profit Margin: {reportData.profitMargin.toFixed(2)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;
