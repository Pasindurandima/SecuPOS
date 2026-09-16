import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, X, Eye } from 'lucide-react';

const ImportSales = () => {
  const [file, setFile] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const [importHistory] = useState([
    {
      id: 1,
      fileName: 'sales_october_2025.csv',
      importDate: '2025-11-01 10:30:00',
      totalRecords: 150,
      successful: 148,
      failed: 2,
      status: 'COMPLETED'
    },
    {
      id: 2,
      fileName: 'bulk_sales_september.xlsx',
      importDate: '2025-10-02 14:15:00',
      totalRecords: 200,
      successful: 200,
      failed: 0,
      status: 'COMPLETED'
    },
    {
      id: 3,
      fileName: 'sales_data_august.csv',
      importDate: '2025-09-05 09:45:00',
      totalRecords: 180,
      successful: 175,
      failed: 5,
      status: 'COMPLETED_WITH_ERRORS'
    }
  ]);

  const samplePreviewData = [
    {
      invoiceNo: 'INV-1001',
      customer: 'John Doe',
      date: '2025-11-01',
      items: 'Product A, Product B',
      total: 15000,
      status: 'Valid'
    },
    {
      invoiceNo: 'INV-1002',
      customer: 'Jane Smith',
      date: '2025-11-02',
      items: 'Product C',
      total: 8500,
      status: 'Valid'
    },
    {
      invoiceNo: 'INV-1003',
      customer: '',
      date: '2025-11-03',
      items: 'Product D, Product E',
      total: 12000,
      status: 'Error: Missing customer'
    }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportStatus(null);
    }
  };

  const handlePreview = () => {
    if (file) {
      setPreviewData(samplePreviewData);
      setShowPreview(true);
    }
  };

  const handleImport = () => {
    if (file) {
      setImportStatus('processing');
      // Simulate import process
      setTimeout(() => {
        setImportStatus('success');
        setFile(null);
        setShowPreview(false);
      }, 2000);
    }
  };

  const handleDownloadTemplate = () => {
    console.log('Downloading CSV template...');
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImportStatus(null);
    setShowPreview(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'COMPLETED_WITH_ERRORS': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800',
      'PROCESSING': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Import Sales</h1>
        <p className="text-gray-600 mt-2">Bulk import sales data from CSV or Excel files</p>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload File</h2>
        
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
          {!file ? (
            <div>
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">Drag and drop your file here, or</p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors inline-block">
                  Browse Files
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-4">Supported formats: CSV, XLSX, XLS (Max 10MB)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-teal-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {file && !importStatus && (
          <div className="flex justify-between items-center">
            <button
              onClick={handleDownloadTemplate}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </button>
            <div className="flex space-x-4">
              <button
                onClick={handlePreview}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Data</span>
              </button>
              <button
                onClick={handleImport}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import Sales</span>
              </button>
            </div>
          </div>
        )}

        {/* Import Status */}
        {importStatus === 'processing' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800 font-medium">Processing import... Please wait.</span>
          </div>
        )}

        {importStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800 font-medium">Import completed successfully!</span>
          </div>
        )}

        {/* Template Download Button (always visible) */}
        {!file && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleDownloadTemplate}
              className="text-teal-600 hover:text-teal-800 font-medium flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Template</span>
            </button>
          </div>
        )}
      </div>

      {/* Data Preview Modal */}
      {showPreview && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Data Preview</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index} className={row.status.includes('Error') ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.invoiceNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.customer || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.items}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs {row.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {row.status.includes('Error') ? (
                        <span className="flex items-center text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {row.status}
                        </span>
                      ) : (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {row.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Validation Summary</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Found 1 error in the data. Please review and correct before importing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Import Instructions</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li className="flex items-start">
            <span className="font-bold mr-2">1.</span>
            <span>Download the CSV template using the button above</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">2.</span>
            <span>Fill in your sales data following the template format</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">3.</span>
            <span>Required fields: Invoice No, Customer, Date, Items, and Total Amount</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">4.</span>
            <span>Ensure customer names match existing customers in the system</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">5.</span>
            <span>Date format should be: YYYY-MM-DD (e.g., 2025-11-04)</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">6.</span>
            <span>Upload your file and click "Preview Data" to verify before importing</span>
          </li>
        </ul>
      </div>

      {/* Import History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Import History</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Import Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Records</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Successful</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {importHistory.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      {record.fileName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.importDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.totalRecords}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {record.successful}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {record.failed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-teal-600 hover:text-teal-800 mr-3">View Details</button>
                    {record.failed > 0 && (
                      <button className="text-red-600 hover:text-red-800">Download Errors</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* History Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Imports</div>
            <div className="text-2xl font-bold text-blue-900">{importHistory.length}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Total Records</div>
            <div className="text-2xl font-bold text-purple-900">
              {importHistory.reduce((sum, record) => sum + record.totalRecords, 0)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Successful</div>
            <div className="text-2xl font-bold text-green-900">
              {importHistory.reduce((sum, record) => sum + record.successful, 0)}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600 font-medium">Failed</div>
            <div className="text-2xl font-bold text-red-900">
              {importHistory.reduce((sum, record) => sum + record.failed, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportSales;
