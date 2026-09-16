package com.example.demo.dto;
import lombok.Data;
@Data
public class SettingsProfileDTO {
    private String businessName, currency, timeZone, fiscalYearStart, phone, email, website, address;
    private Boolean automaticInventoryTracking, lowStockAlerts, emailNotifications, multiCurrency;
    private String invoicePrefix, invoiceTemplate, paymentTerms, invoiceHeaderText, invoiceFooterText, invoiceTerms;
    private Integer invoiceStartingNumber;
    private Boolean showCompanyLogo, showTaxBreakdown, showPaymentInstructions, showQrCode, autoSendInvoice;
    private String barcodeType, barcodePrefix, paperSize;
    private Integer labelsPerSheet, barcodeHeight, barcodeWidth;
    private Boolean showProductName, showProductCode, showPrice, showBusinessName, showBusinessLogo;
}