import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '../services/apiService';

export const businessSettingsDefaults = {
  businessName: '',
  currency: 'LKR',
  timeZone: 'Asia/Colombo',
  fiscalYearStart: 'January',
  phone: '',
  email: '',
  website: '',
  address: '',
};

const storageKey = 'businessSettings';
const BusinessSettingsContext = createContext(businessSettingsDefaults);

export const readBusinessSettings = () => {
  try {
    return { ...businessSettingsDefaults, ...JSON.parse(localStorage.getItem(storageKey) || '{}') };
  } catch {
    return businessSettingsDefaults;
  }
};

export const persistBusinessSettings = (settings) => {
  const nextSettings = { ...businessSettingsDefaults, ...settings };
  localStorage.setItem(storageKey, JSON.stringify(nextSettings));
  window.dispatchEvent(new CustomEvent('business-settings-updated', { detail: nextSettings }));
  return nextSettings;
};

const currencySymbols = { LKR: 'Rs', INR: 'Rs', USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', AUD: 'A$', CAD: 'CA$', SGD: 'S$', AED: 'د.إ', SAR: '﷼' };

export const formatCurrency = (value, settings = readBusinessSettings()) => {
  const amount = Number(value || 0);
  const number = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return `${currencySymbols[settings.currency] || settings.currency || 'Rs'} ${number}`;
};

export const formatDate = (value, settings = readBusinessSettings(), options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', { ...options, timeZone: settings.timeZone || 'Asia/Colombo' });
};

export function BusinessSettingsProvider({ children }) {
  const [settings, setSettings] = useState(readBusinessSettings);

  useEffect(() => {
    const updateSettings = (event) => setSettings({ ...businessSettingsDefaults, ...(event.detail || readBusinessSettings()) });
    const loadSettings = async () => {
      try {
        persistBusinessSettings(await settingsService.getProfile());
      } catch {
        setSettings(readBusinessSettings());
      }
    };
    window.addEventListener('business-settings-updated', updateSettings);
    loadSettings();
    return () => window.removeEventListener('business-settings-updated', updateSettings);
  }, []);

  return <BusinessSettingsContext.Provider value={settings}>{children}</BusinessSettingsContext.Provider>;
}

export const useBusinessSettings = () => useContext(BusinessSettingsContext);