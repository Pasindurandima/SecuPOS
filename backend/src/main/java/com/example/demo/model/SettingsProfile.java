package com.example.demo.model;

import com.example.demo.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "settings_profiles")
@Data
@NoArgsConstructor
public class SettingsProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    private String businessName = "";
    private String currency = "LKR";
    private String timeZone = "Asia/Colombo";
    private String fiscalYearStart = "January";
    private String phone;
    private String email;
    private String website;
    @Column(length = 1000) private String address;
    private Boolean automaticInventoryTracking = true;
    private Boolean lowStockAlerts = true;
    private Boolean emailNotifications = true;
    private Boolean multiCurrency = false;

    private String invoicePrefix = "INV-";
    private Integer invoiceStartingNumber = 1001;
    private String invoiceTemplate = "Default Template";
    private String paymentTerms = "Due on Receipt";
    @Column(length = 1000) private String invoiceHeaderText;
    @Column(length = 2000) private String invoiceFooterText;
    @Column(length = 4000) private String invoiceTerms;
    private Boolean showCompanyLogo = true;
    private Boolean showTaxBreakdown = true;
    private Boolean showPaymentInstructions = false;
    private Boolean showQrCode = true;
    private Boolean autoSendInvoice = false;

    private String barcodeType = "Code 128";
    private String barcodePrefix;
    private String paperSize = "A4";
    private Integer labelsPerSheet = 12;
    private Integer barcodeHeight = 30;
    private Integer barcodeWidth = 50;
    private Boolean showProductName = true;
    private Boolean showProductCode = true;
    private Boolean showPrice = true;
    private Boolean showBusinessName = false;
    private Boolean showBusinessLogo = false;
}