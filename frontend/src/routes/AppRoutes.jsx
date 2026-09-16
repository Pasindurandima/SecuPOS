import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from '../components/PrivateRoute';
import Dashboard from '../pages/Dashboard';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import UserManagement from '../pages/UserManagement';
import Contacts from '../pages/Contacts';
import Products from '../pages/Products';
import Purchases from '../pages/Purchases';
import Sell from '../pages/Sell';
import StockTransfers from '../pages/StockTransfers';
import StockAdjustment from '../pages/StockAdjustment';
import Expenses from '../pages/Expenses';
import PaymentAccounts from '../pages/PaymentAccounts';
import Reports from '../pages/Reports';
import NotificationTemplates from '../pages/NotificationTemplates';
import Settings from '../pages/Settings';
import HRM from '../pages/HRM';
import Essentials from '../pages/Essentials';
import Profile from '../pages/Profile';
import SignOut from '../pages/SignOut';

// User Management
import Users from '../pages/UserManagement/Users';
import Roles from '../pages/UserManagement/Roles';
import Agents from '../pages/UserManagement/Agents';

// Contacts
import Suppliers from '../pages/Contacts/Suppliers';
import Customers from '../pages/Contacts/Customers';
import CustomerGroups from '../pages/Contacts/CustomerGroups';
import ImportContacts from '../pages/Contacts/ImportContacts';

// Products
import ListProduct from '../pages/Products/ListProduct';
import AddProduct from '../pages/Products/AddProduct';
import UpdatePrice from '../pages/Products/UpdatePrice';
import PrintLabel from '../pages/Products/PrintLabel';
import Variations from '../pages/Products/Variations';
import ImportProducts from '../pages/Products/ImportProducts';
import ImportOpeningStock from '../pages/Products/ImportOpeningStock';
import SellingPriceGroup from '../pages/Products/SellingPriceGroup';
import Units from '../pages/Products/Units';
import Categories from '../pages/Products/Categories';
import Brands from '../pages/Products/Brands';

// Purchases
import ListPurchase from '../pages/Purchases/ListPurchase';
import AddPurchase from '../pages/Purchases/AddPurchase';
import ListPurchaseReturn from '../pages/Purchases/ListPurchaseReturn';

// Sell
import AllSales from '../pages/Sell/AllSales';
import ListPOS from '../pages/Sell/ListPOS';
import POS from '../pages/Sell/POS';
import AddQuotation from '../pages/Sell/AddQuotation';
import ListQuotations from '../pages/Sell/ListQuotations';
import ListSellReturn from '../pages/Sell/ListSellReturn';
import Shipments from '../pages/Sell/Shipments';
import ImportSales from '../pages/Sell/ImportSales';

// Stock Transfers
import ListStockTransfers from '../pages/StockTransfers/ListStockTransfers';
import AddStockTransfers from '../pages/StockTransfers/AddStockTransfers';

// Stock Adjustment
import ListStockAdjustments from '../pages/StockAdjustment/ListStockAdjustments';
import AddStockAdjustments from '../pages/StockAdjustment/AddStockAdjustments';

// Expenses
import ListExpenses from '../pages/Expenses/ListExpenses';
import AddExpenses from '../pages/Expenses/AddExpenses';
import ExpensesCategories from '../pages/Expenses/ExpensesCategories';

// Payment Accounts
import ListAccounts from '../pages/PaymentAccounts/ListAccounts';
import BalanceSheet from '../pages/PaymentAccounts/BalanceSheet';
import TrialBalance from '../pages/PaymentAccounts/TrialBalance';
import CashFlow from '../pages/PaymentAccounts/CashFlow';
import PaymentAccountReport from '../pages/PaymentAccounts/PaymentAccountReport';

// Reports
import ProfitLossReport from '../pages/Reports/ProfitLossReport';
import PurchaseSaleReport from '../pages/Reports/PurchaseSaleReport';
import TaxReport from '../pages/Reports/TaxReport';
import SupplierCustomerReport from '../pages/Reports/SupplierCustomerReport';
import CustomerGroupsReport from '../pages/Reports/CustomerGroupsReport';
import StockReport from '../pages/Reports/StockReport';
import StockAdjustmentReport from '../pages/Reports/StockAdjustmentReport';
import TrendingProductsReport from '../pages/Reports/TrendingProductsReport';
import ItemsReport from '../pages/Reports/ItemsReport';
import ProductPurchaseReport from '../pages/Reports/ProductPurchaseReport';
import ProductSellReport from '../pages/Reports/ProductSellReport';
import PurchasePaymentReport from '../pages/Reports/PurchasePaymentReport';
import SellPaymentReport from '../pages/Reports/SellPaymentReport';
import ExpenseReport from '../pages/Reports/ExpenseReport';
import RegisterReport from '../pages/Reports/RegisterReport';
import SalesRepresentativeReport from '../pages/Reports/SalesRepresentativeReport';
import ActivityLog from '../pages/Reports/ActivityLog';

// Settings
import BusinessSettings from '../pages/Settings/BusinessSettings';
import BusinessLocations from '../pages/Settings/BusinessLocations';
import InvoiceSettings from '../pages/Settings/InvoiceSettings';
import BarcodeSettings from '../pages/Settings/BarcodeSettings';
import ReceiptPrinters from '../pages/Settings/ReceiptPrinters';
import TaxRates from '../pages/Settings/TaxRates';
import PackageSubscription from '../pages/Settings/PackageSubscription';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - No Authentication Required */}
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      
      {/* Protected Routes - Authentication Required */}
      <Route path="/*" element={
        <PrivateRoute>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
        
        {/* User Management Routes */}
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/user-management/users" element={<Users />} />
        <Route path="/user-management/roles" element={<Roles />} />
        <Route path="/user-management/agents" element={<Agents />} />
        
        {/* Contacts Routes */}
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/contacts/suppliers" element={<Suppliers />} />
        <Route path="/contacts/customers" element={<Customers />} />
        <Route path="/contacts/customer-groups" element={<CustomerGroups />} />
        <Route path="/contacts/import" element={<ImportContacts />} />
        
        {/* Products Routes */}
        <Route path="/products" element={<Products />} />
        <Route path="/products/list" element={<ListProduct />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/products/update-price" element={<UpdatePrice />} />
        <Route path="/products/print-label" element={<PrintLabel />} />
        <Route path="/products/variations" element={<Variations />} />
        <Route path="/products/import" element={<ImportProducts />} />
        <Route path="/products/import-opening-stock" element={<ImportOpeningStock />} />
        <Route path="/products/selling-price-group" element={<SellingPriceGroup />} />
        <Route path="/products/units" element={<Units />} />
        <Route path="/products/categories" element={<Categories />} />
        <Route path="/products/brands" element={<Brands />} />
        
        {/* Purchases Routes */}
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/purchases/list" element={<ListPurchase />} />
        <Route path="/purchases/add" element={<AddPurchase />} />
        <Route path="/purchases/return" element={<ListPurchaseReturn />} />
        
        {/* Sell Routes */}
        <Route path="/sell" element={<Sell />} />
        <Route path="/sell/all-sales" element={<AllSales />} />
        <Route path="/sell/list-pos" element={<ListPOS />} />
        <Route path="/sell/pos" element={<POS />} />
        <Route path="/sell/add-quotation" element={<AddQuotation />} />
        <Route path="/sell/list-quotations" element={<ListQuotations />} />
        <Route path="/sell/list-return" element={<ListSellReturn />} />
        <Route path="/sell/shipments" element={<Shipments />} />
        <Route path="/sell/import-sales" element={<ImportSales />} />
        
        {/* Stock Transfers Routes */}
        <Route path="/stock-transfers" element={<StockTransfers />} />
        <Route path="/stock-transfers/list" element={<ListStockTransfers />} />
        <Route path="/stock-transfers/add" element={<AddStockTransfers />} />
        
        {/* Stock Adjustment Routes */}
        <Route path="/stock-adjustment" element={<StockAdjustment />} />
        <Route path="/stock-adjustment/list" element={<ListStockAdjustments />} />
        <Route path="/stock-adjustment/add" element={<AddStockAdjustments />} />
        
        {/* Expenses Routes */}
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/expenses/list" element={<ListExpenses />} />
        <Route path="/expenses/add" element={<AddExpenses />} />
        <Route path="/expenses/categories" element={<ExpensesCategories />} />
        
        {/* Payment Accounts Routes */}
        <Route path="/payment-accounts" element={<PaymentAccounts />} />
        <Route path="/payment-accounts/list" element={<ListAccounts />} />
        <Route path="/payment-accounts/balance-sheet" element={<BalanceSheet />} />
        <Route path="/payment-accounts/trial-balance" element={<TrialBalance />} />
        <Route path="/payment-accounts/cash-flow" element={<CashFlow />} />
        <Route path="/payment-accounts/report" element={<PaymentAccountReport />} />
        
        {/* Reports Routes */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/profit-loss" element={<ProfitLossReport />} />
        <Route path="/reports/purchase-sale" element={<PurchaseSaleReport />} />
        <Route path="/reports/tax" element={<TaxReport />} />
        <Route path="/reports/supplier-customer" element={<SupplierCustomerReport />} />
        <Route path="/reports/customer-groups" element={<CustomerGroupsReport />} />
        <Route path="/reports/stock" element={<StockReport />} />
        <Route path="/reports/stock-adjustment" element={<StockAdjustmentReport />} />
        <Route path="/reports/trending-products" element={<TrendingProductsReport />} />
        <Route path="/reports/items" element={<ItemsReport />} />
        <Route path="/reports/product-purchase" element={<ProductPurchaseReport />} />
        <Route path="/reports/product-sell" element={<ProductSellReport />} />
        <Route path="/reports/purchase-payment" element={<PurchasePaymentReport />} />
        <Route path="/reports/sell-payment" element={<SellPaymentReport />} />
        <Route path="/reports/expense" element={<ExpenseReport />} />
        <Route path="/reports/register" element={<RegisterReport />} />
        <Route path="/reports/sales-representative" element={<SalesRepresentativeReport />} />
        <Route path="/reports/activity-log" element={<ActivityLog />} />
        
        {/* Other Routes */}
        <Route path="/notification-templates" element={<NotificationTemplates />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Settings Routes */}
        <Route path="/settings/business" element={<BusinessSettings />} />
        <Route path="/settings/locations" element={<BusinessLocations />} />
        <Route path="/settings/invoice" element={<InvoiceSettings />} />
        <Route path="/settings/barcode" element={<BarcodeSettings />} />
        <Route path="/settings/printers" element={<ReceiptPrinters />} />
        <Route path="/settings/tax-rates" element={<TaxRates />} />
        <Route path="/settings/subscription" element={<PackageSubscription />} />
        <Route path="/hrm" element={<HRM />} />
        <Route path="/essentials" element={<Essentials />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signout" element={<SignOut />} />
            </Routes>
          </MainLayout>
        </PrivateRoute>
      } />
    </Routes>
  );
}
