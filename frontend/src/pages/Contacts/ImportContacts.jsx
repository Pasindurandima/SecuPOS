import React from 'react';
import { FaUpload, FaFileExcel, FaDownload } from 'react-icons/fa';

const ImportContacts = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Import Contacts</h1>
        <p className="text-gray-600 mt-2">Bulk import customers and suppliers</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Download Template</h2>
        <p className="text-gray-600 mb-4">Download the Excel template to format your contact data correctly</p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <FaDownload />
          Download Template
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Upload File</h2>
        <p className="text-gray-600 mb-4">Select an Excel or CSV file to import contacts</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
          <FaFileExcel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop your file here or</p>
          <label className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2">
            <FaUpload />
            Browse File
            <input type="file" className="hidden" accept=".xlsx,.xls,.csv" />
          </label>
          <p className="text-sm text-gray-500 mt-2">Supported formats: Excel (.xlsx, .xls), CSV</p>
        </div>
        
        <div className="mt-6">
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors">
            Import Contacts
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportContacts;
