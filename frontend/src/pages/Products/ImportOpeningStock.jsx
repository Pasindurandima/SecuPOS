import React from 'react';
import { FaUpload, FaDownload } from 'react-icons/fa';

const ImportOpeningStock = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Import Opening Stock</h1>
        <p className="text-gray-600 mt-2">Bulk import opening stock quantities</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Download Template</h2>
        <p className="text-gray-600 mb-4">Download the template with current products to add opening stock</p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <FaDownload />
          Download Opening Stock Template
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Upload File</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors mb-4">
          <FaUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop your file here or</p>
          <label className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2">
            <FaUpload />
            Browse File
            <input type="file" className="hidden" accept=".xlsx,.xls,.csv" />
          </label>
          <p className="text-sm text-gray-500 mt-2">Supported formats: Excel (.xlsx, .xls), CSV</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
          <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
            <li>Opening stock can only be added once per product</li>
            <li>Required fields: SKU/Product ID, Quantity, Purchase Price</li>
            <li>Optional fields: Location, Lot Number, Expiry Date</li>
            <li>Ensure product SKUs match existing products</li>
            <li>This will update the current stock quantity</li>
          </ul>
        </div>
        
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors">
          Import Opening Stock
        </button>
      </div>
    </div>
  );
};

export default ImportOpeningStock;
