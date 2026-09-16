package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseResponse {
    
    private Long id;
    private String purchaseNumber;
    private SupplierResponse supplier;
    private String supplierAddress;
    private String referenceNo;
    private LocalDateTime purchaseDate;
    private String status;
    private String businessLocation;
    private Integer payTerm;
    private String attachedDocumentPath;
    private List<PurchaseItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private String discountType;
    private BigDecimal tax;
    private BigDecimal taxPercent;
    private BigDecimal shippingCharges;
    private BigDecimal total;
    private String additionalNotes;
    private BigDecimal paidAmount;
    private LocalDateTime paidOn;
    private String paymentMethod;
    private String paymentAccount;
    private String paymentNote;
    private BigDecimal paymentDue;
    private LocalDateTime createdAt;
}
