import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { BusinessSettingsProvider } from './context/BusinessSettingsContext';

export default function App() {
  return <BusinessSettingsProvider><AppRoutes /></BusinessSettingsProvider>;
}
