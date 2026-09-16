import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, FaChevronDown, FaChevronRight, FaUsers, FaAddressBook, 
  FaBox, FaShoppingCart, FaMoneyBillWave, FaExchangeAlt, FaClipboardList,
  FaWallet, FaCreditCard, FaChartBar, FaBell, FaCog, FaUserTie,
  FaLightbulb, FaUserCircle, FaSignOutAlt, FaAngleRight
} from 'react-icons/fa';
import { hasPermission, permissionForPath } from '../../utils/permissions';
import { useBusinessSettings } from '../../context/BusinessSettingsContext';

const menuItems = [
  { name: 'Home', path: '/', icon: FaHome },
  { 
    name: 'User Management', 
    path: '/user-management',
    icon: FaUsers,
    hasSubmenu: true,
    submenu: [
      { name: 'Users', path: '/user-management/users' },
      { name: 'Roles', path: '/user-management/roles' },
      { name: 'Agents', path: '/user-management/agents' },
    ]
  },
  { 
    name: 'Contacts', 
    path: '/contacts', 
    icon: FaAddressBook,
    hasSubmenu: true,
    submenu: [
      { name: 'Suppliers', path: '/contacts/suppliers' },
      { name: 'Customers', path: '/contacts/customers' },
      { name: 'Customer Groups', path: '/contacts/customer-groups' },
      { name: 'Import Contacts', path: '/contacts/import' },
    ]
  },
  { 
    name: 'Products', 
    path: '/products', 
    icon: FaBox,
    hasSubmenu: true,
    submenu: [
      { name: 'List Product', path: '/products/list' },
      { name: 'Add Product', path: '/products/add' },
      { name: 'Update Price', path: '/products/update-price' },
      { name: 'Print Label', path: '/products/print-label' },
      { name: 'Variations', path: '/products/variations' },
      { name: 'Import Products', path: '/products/import' },
      { name: 'Import Opening Stock', path: '/products/import-opening-stock' },
      { name: 'Selling Price Group', path: '/products/selling-price-group' },
      { name: 'Units', path: '/products/units' },
      { name: 'Categories', path: '/products/categories' },
      { name: 'Brands', path: '/products/brands' },
    ]
  },
  { 
    name: 'Purchases', 
    path: '/purchases', 
    icon: FaShoppingCart,
    hasSubmenu: true,
    submenu: [
      { name: 'List Purchase', path: '/purchases/list' },
      { name: 'Add Purchase', path: '/purchases/add' },
      { name: 'List Purchase Return', path: '/purchases/return' },
    ]
  },
  { 
    name: 'Sell', 
    path: '/sell', 
    icon: FaMoneyBillWave,
    hasSubmenu: true,
    submenu: [
      { name: 'All Sales', path: '/sell/all-sales' },
      { name: 'List POS', path: '/sell/list-pos' },
      { name: 'POS', path: '/sell/pos' },
      { name: 'Add Quotation', path: '/sell/add-quotation' },
      { name: 'List Quotations', path: '/sell/list-quotations' },
      { name: 'List Sell Return', path: '/sell/list-return' },
      { name: 'Shipments', path: '/sell/shipments' },
      { name: 'Import Sales', path: '/sell/import-sales' },
    ]
  },
  { 
    name: 'Stock Transfers', 
    path: '/stock-transfers', 
    icon: FaExchangeAlt,
    hasSubmenu: true,
    submenu: [
      { name: 'List Stock Transfers', path: '/stock-transfers/list' },
      { name: 'Add Stock Transfers', path: '/stock-transfers/add' },
    ]
  },
  { 
    name: 'Stock Adjustment', 
    path: '/stock-adjustment', 
    icon: FaClipboardList,
    hasSubmenu: true,
    submenu: [
      { name: 'List Stock Adjustments', path: '/stock-adjustment/list' },
      { name: 'Add Stock Adjustments', path: '/stock-adjustment/add' },
    ]
  },
  { 
    name: 'Expenses', 
    path: '/expenses', 
    icon: FaWallet,
    hasSubmenu: true,
    submenu: [
      { name: 'List Expenses', path: '/expenses/list' },
      { name: 'Add Expenses', path: '/expenses/add' },
      { name: 'Expenses Categories', path: '/expenses/categories' },
    ]
  },
  { 
    name: 'Payment Accounts', 
    path: '/payment-accounts', 
    icon: FaCreditCard,
    hasSubmenu: true,
    submenu: [
      { name: 'List Accounts', path: '/payment-accounts/list' },
      { name: 'Balance Sheet', path: '/payment-accounts/balance-sheet' },
      { name: 'Trial Balance', path: '/payment-accounts/trial-balance' },
      { name: 'Cash Flow', path: '/payment-accounts/cash-flow' },
      { name: 'Payment Account Report', path: '/payment-accounts/report' },
    ]
  },
  { 
    name: 'Reports', 
    path: '/reports', 
    icon: FaChartBar,
    hasSubmenu: true,
    submenu: [
      { name: 'Profit/Loss Report', path: '/reports/profit-loss' },
      { name: 'Purchase & Sale', path: '/reports/purchase-sale' },
      { name: 'Tax Report', path: '/reports/tax' },
      { name: 'Supplier & Customer Report', path: '/reports/supplier-customer' },
      { name: 'Customer Groups Report', path: '/reports/customer-groups' },
      { name: 'Stock Report', path: '/reports/stock' },
      { name: 'Stock Adjustment Report', path: '/reports/stock-adjustment' },
      { name: 'Trending Products', path: '/reports/trending-products' },
      { name: 'Items Report', path: '/reports/items' },
      { name: 'Product Purchase Report', path: '/reports/product-purchase' },
      { name: 'Product Sell Report', path: '/reports/product-sell' },
      { name: 'Purchase Payment Report', path: '/reports/purchase-payment' },
      { name: 'Sell Payment Report', path: '/reports/sell-payment' },
      { name: 'Expense Report', path: '/reports/expense' },
      { name: 'Register Report', path: '/reports/register' },
      { name: 'Sales Representative Report', path: '/reports/sales-representative' },
      { name: 'Activity Log', path: '/reports/activity-log' },
    ]
  },
  { name: 'Notification Templates', path: '/notification-templates', icon: FaBell },
  { 
    name: 'Settings', 
    path: '/settings', 
    icon: FaCog,
    hasSubmenu: true,
    submenu: [
      { name: 'Business Settings', path: '/settings/business' },
      { name: 'Business Locations', path: '/settings/locations' },
      { name: 'Invoice Settings', path: '/settings/invoice' },
      { name: 'Barcode Settings', path: '/settings/barcode' },
      { name: 'Receipt Printers', path: '/settings/printers' },
      { name: 'Tax Rates', path: '/settings/tax-rates' },
    ]
  },
  { name: 'Essentials', path: '/essentials', icon: FaLightbulb },
  { name: 'Profile', path: '/profile', icon: FaUserCircle },
  { name: 'Sign Out', path: '/signout', icon: FaSignOutAlt },
];

export default function Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState({});
  const { businessName } = useBusinessSettings();
  const displayBusinessName = businessName?.trim() || 'Business Name';
  const visibleMenuItems = menuItems
    .map((item) => ({
      ...item,
      submenu: item.submenu?.filter((sub) => {
        const permission = permissionForPath(sub.path);
        return !permission || hasPermission(permission);
      })
    }))
    .filter((item) => {
      const permission = permissionForPath(item.path);
      return !item.hasSubmenu
        ? !permission || hasPermission(permission)
        : item.submenu?.length > 0 || !permission || hasPermission(permission);
    });

  const toggleSubmenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  return (
    <aside className="w-54 bg-emerald-800 text-white h-screen p-4 overflow-y-auto flex-shrink-0">
      <div className="mb-6 truncate text-xl font-bold" title={displayBusinessName}>{displayBusinessName}</div>

      <nav className="flex flex-col space-y-1 pb-6">
        {visibleMenuItems.map((m) => (
          <div key={m.path}>
            {m.hasSubmenu ? (
              <div>
                <button
                  onClick={() => toggleSubmenu(m.name)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-emerald-700/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <m.icon className="w-4 h-4" />
                    <span className="text-sm">{m.name}</span>
                  </div>
                  {expandedMenus[m.name] ? (
                    <FaChevronDown className="w-3 h-3" />
                  ) : (
                    <FaChevronRight className="w-3 h-3" />
                  )}
                </button>
                
                {expandedMenus[m.name] && m.submenu && (
                  <div className="ml-6 mt-1 space-y-1">
                    {m.submenu.map((sub) => (
                      <NavLink
                        to={sub.path}
                        key={sub.path}
                        className={({ isActive }) =>
                          'flex items-center gap-2 px-3 py-2 rounded text-sm ' +
                          (isActive ? 'bg-emerald-700' : 'hover:bg-emerald-700/70')
                        }
                      >
                        <FaAngleRight className="w-3 h-3" />
                        <span>{sub.name}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to={m.path}
                className={({ isActive }) =>
                  'flex items-center gap-3 px-3 py-2 rounded ' +
                  (isActive ? 'bg-emerald-700' : 'hover:bg-emerald-700/70')
                }
                end={m.path === '/'}
              >
                <m.icon className="w-4 h-4" />
                <span className="text-sm">{m.name}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
