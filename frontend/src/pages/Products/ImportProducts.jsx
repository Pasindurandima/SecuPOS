import React from 'react';
import { FaUpload, FaDownload } from 'react-icons/fa';

const ImportProducts = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Import Products</h1>
        <p className="text-gray-600 mt-2">Bulk import products from Excel/CSV</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Download Template</h2>
        <p className="text-gray-600 mb-4">Download the Excel template to format your product data correctly</p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <FaDownload />
          Download Product Template
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">Import Instructions:</h3>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>Download the template and fill in product details</li>
            <li>Required fields: Product Name, SKU, Category, Selling Price</li>
            <li>Optional fields: Brand, Unit, Description, Purchase Price</li>
            <li>Ensure SKU values are unique</li>
            <li>Use exact category and brand names as in the system</li>
          </ul>
        </div>
        
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors">
          Import Products
        </button>
      </div>
    </div>
  );
};

export default ImportProducts;
