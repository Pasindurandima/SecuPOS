import React, { useState, useEffect } from 'react';
import { Printer, FileText, Barcode, Package, Search, X } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { productService } from '../../services/apiService';
import { formatCurrency, readBusinessSettings } from '../../context/BusinessSettingsContext';

const PrintLabel = () => {
  const [labelConfig, setLabelConfig] = useState({
    searchTerm: '',
    labelType: 'BARCODE',
    numberOfLabels: 1,
    paperSize: '30_PER_SHEET',
    includeProductName: true,
    includePrice: true,
    includeBarcode: true,
    includeCompanyName: false
  });

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (labelConfig.searchTerm.trim()) {
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(labelConfig.searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(labelConfig.searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(labelConfig.searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredProducts([]);
      setShowDropdown(false);
    }
  }, [labelConfig.searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for label printing...');
      const data = await productService.getAll();
      console.log('Products fetched:', data.length);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLabelConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setLabelConfig(prev => ({
      ...prev,
      searchTerm: product.name
    }));
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    setLabelConfig(prev => ({
      ...prev,
      searchTerm: ''
    }));
  };

  const renderBarcodes = (printWindow) => {
    const barcodeValue = selectedProduct.barcode || selectedProduct.sku || 'N/A';
    printWindow.document.querySelectorAll('.product-barcode').forEach((barcode) => {
      JsBarcode(barcode, barcodeValue, {
        format: 'CODE128',
        displayValue: false,
        height: 30,
        width: 1.5,
        margin: 0
      });
    });
  };

  const generateLabelHTML = () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return null;
    }

    const { labelType, numberOfLabels, paperSize, includeProductName, includePrice, includeBarcode, includeCompanyName } = labelConfig;
    
    let labelHTML = '';
    const labelsPerRow = paperSize === '30_PER_SHEET' ? 3 : paperSize === '20_PER_SHEET' ? 2 : paperSize === '12_PER_SHEET' ? 2 : 1;
    const labelWidth = paperSize === '30_PER_SHEET' ? '30%' : paperSize === '20_PER_SHEET' ? '45%' : paperSize === '12_PER_SHEET' ? '45%' : '100%';
    const labelHeight = paperSize === '30_PER_SHEET' ? '1in' : paperSize === '20_PER_SHEET' ? '1in' : paperSize === '12_PER_SHEET' ? '2in' : 'auto';

    for (let i = 0; i < numberOfLabels; i++) {
      labelHTML += `
        <div style="
          width: ${labelWidth};
          height: ${labelHeight};
          border: 1px solid #ccc;
          padding: 8px;
          margin: 4px;
          display: inline-block;
          text-align: center;
          page-break-inside: avoid;
          font-family: Arial, sans-serif;
        ">
          ${includeCompanyName ? '<div style="font-size: 8px; font-weight: bold; margin-bottom: 4px;">YOUR COMPANY NAME</div>' : ''}
          ${includeProductName ? `<div style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">${selectedProduct.name}</div>` : ''}
          ${includePrice ? `<div style="font-size: 14px; font-weight: bold; color: #0d9488; margin-bottom: 4px;">${formatCurrency(selectedProduct.sellingPrice, readBusinessSettings())}</div>` : ''}
          ${includeBarcode ? `
            <div style="margin-top: 4px;">
              <svg class="product-barcode" width="100" height="30"></svg>
              <div style="font-size: 8px; margin-top: 2px;">${selectedProduct.sku || selectedProduct.barcode || 'N/A'}</div>
            </div>
          ` : ''}
        </div>
      `;
    }

    return labelHTML;
  };

  const handlePreviewPDF = () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }

    const labelHTML = generateLabelHTML();
    if (!labelHTML) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Label Preview - ${selectedProduct.name}</title>
        <style>
          body {
            margin: 20px;
            font-family: Arial, sans-serif;
          }
          .labels-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; padding: 15px; background: #f0f9ff; border: 1px solid #0891b2; border-radius: 8px;">
          <h2 style="margin: 0 0 10px 0; color: #0e7490;">Label Preview</h2>
          <p style="margin: 0 0 10px 0;">Product: <strong>${selectedProduct.name}</strong></p>
          <p style="margin: 0 0 10px 0;">Total Labels: <strong>${labelConfig.numberOfLabels}</strong></p>
          <p style="margin: 0;">Paper Size: <strong>${labelConfig.paperSize.replace('_', ' ')}</strong></p>
          <button onclick="window.print()" style="margin-top: 15px; padding: 10px 20px; background: #0d9488; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
            Print Labels
          </button>
          <button onclick="window.close()" style="margin-top: 15px; margin-left: 10px; padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
            Close
          </button>
        </div>
        <div class="labels-container">
          ${labelHTML}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    renderBarcodes(printWindow);
  };

  const handlePrint = () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }

    const labelHTML = generateLabelHTML();
    if (!labelHTML) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Labels - ${selectedProduct.name}</title>
        <style>
          body {
            margin: 0;
            padding: 10px;
            font-family: Arial, sans-serif;
          }
          .labels-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
          }
          @media print {
            body { margin: 0; padding: 5px; }
          }
        </style>
      </head>
      <body>
        <div class="labels-container">
          ${labelHTML}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    renderBarcodes(printWindow);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Print Label</h1>
        <p className="text-gray-600 mt-2">Generate and print product labels</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Product</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="searchTerm"
              value={labelConfig.searchTerm}
              onChange={handleConfigChange}
              placeholder="Search by product name, SKU, or barcode..."
              className="w-full pl-10 pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {selectedProduct && (
              <button
                onClick={handleClearSelection}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            {/* Product Search Dropdown */}
            {showDropdown && !selectedProduct && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin w-6 h-6 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading products...
                  </div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="p-3 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{product.name}</p>
                          <p className="text-sm text-gray-500">SKU: {product.sku || 'N/A'} | Price: Rs {(product.sellingPrice || 0).toFixed(2)}</p>
                        </div>
                        <Package className="w-5 h-5 text-teal-600" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Selected Product Display */}
          {selectedProduct && (
            <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-teal-900">Selected: {selectedProduct.name}</p>
                  <p className="text-sm text-teal-700">
                    SKU: {selectedProduct.sku || 'N/A'} | 
                    Price: Rs {(selectedProduct.sellingPrice || 0).toFixed(2)} | 
                    Stock: {selectedProduct.quantity || 0}
                  </p>
                </div>
                <button
                  onClick={handleClearSelection}
                  className="text-teal-700 hover:text-teal-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label Type</label>
            <select 
              name="labelType"
              value={labelConfig.labelType}
              onChange={handleConfigChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="BARCODE">Barcode Label</option>
              <option value="PRICE_TAG">Price Tag</option>
              <option value="PRODUCT_LABEL">Product Label (Full Details)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Labels</label>
            <input
              type="number"
              name="numberOfLabels"
              value={labelConfig.numberOfLabels}
              onChange={handleConfigChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              min="1"
              max="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paper Size</label>
            <select 
              name="paperSize"
              value={labelConfig.paperSize}
              onChange={handleConfigChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="30_PER_SHEET">30 Labels per Sheet (2.625" x 1")</option>
              <option value="20_PER_SHEET">20 Labels per Sheet (4" x 1")</option>
              <option value="12_PER_SHEET">12 Labels per Sheet (4" x 2")</option>
              <option value="ROLL_CONTINUOUS">Roll (Continuous)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Include on Label</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  name="includeProductName"
                  checked={labelConfig.includeProductName}
                  onChange={handleConfigChange}
                  className="rounded mr-2" 
                />
                <span className="text-sm">Product Name</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  name="includePrice"
                  checked={labelConfig.includePrice}
                  onChange={handleConfigChange}
                  className="rounded mr-2" 
                />
                <span className="text-sm">Price</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  name="includeBarcode"
                  checked={labelConfig.includeBarcode}
                  onChange={handleConfigChange}
                  className="rounded mr-2" 
                />
                <span className="text-sm">Barcode</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  name="includeCompanyName"
                  checked={labelConfig.includeCompanyName}
                  onChange={handleConfigChange}
                  className="rounded mr-2" 
                />
                <span className="text-sm">Company Name</span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 bg-gray-50">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 mb-4">Label Preview</p>
            {selectedProduct ? (
              <div className="bg-white border-2 border-gray-400 inline-block p-4 rounded shadow-sm">
                {labelConfig.includeCompanyName && (
                  <p className="text-xs font-bold text-gray-800 mb-1">YOUR COMPANY NAME</p>
                )}
                {labelConfig.includeProductName && (
                  <p className="text-sm font-semibold text-gray-900">{selectedProduct.name}</p>
                )}
                {labelConfig.includePrice && (
                  <p className="text-sm font-bold text-teal-600 mt-1">Rs {(selectedProduct.sellingPrice || 0).toFixed(2)}</p>
                )}
                {labelConfig.includeBarcode && (
                  <div className="mt-2">
                    <div className="h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Barcode className="w-16 h-8 text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{selectedProduct.sku || selectedProduct.barcode || 'N/A'}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border-2 border-gray-300 inline-block p-4 rounded shadow-sm opacity-50">
                <p className="text-sm text-gray-500">Select a product to preview label</p>
                <Package className="w-12 h-12 mx-auto mt-2 text-gray-300" />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-4">
              Showing {labelConfig.numberOfLabels} label{labelConfig.numberOfLabels > 1 ? 's' : ''} on {labelConfig.paperSize.replace('_', ' ').toLowerCase()}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            disabled={!selectedProduct}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold ${
              selectedProduct 
                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4 h-4" />
            Print Labels
          </button>
          <button 
            onClick={handlePreviewPDF}
            disabled={!selectedProduct}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold ${
              selectedProduct 
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FileText className="w-4 h-4" />
            Preview PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintLabel;
