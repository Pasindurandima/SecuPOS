package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequest {

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    private String supplierAddress;

    private String referenceNo;

    @NotNull(message = "Purchase date is required")
    private LocalDateTime purchaseDate;

    @NotBlank(message = "Purchase status is required")
    private String purchaseStatus;

    @NotBlank(message = "Business location is required")
    private String businessLocation;

    private Integer payTerm;

    private String attachedDocumentPath;

    @NotEmpty(message = "Purchase must have at least one item")
    @Valid
    private List<PurchaseItemRequest> items;

    @NotNull(message = "Subtotal is required")
    private BigDecimal subtotal;

    private BigDecimal discountAmount;

    private String discountType;

    @NotNull(message = "Tax is required")
    private BigDecimal tax;

    private BigDecimal taxPercent;

    private BigDecimal shippingCharges;

    @NotNull(message = "Total is required")
    private BigDecimal total;

    private String additionalNotes;

    // Payment fields
    private BigDecimal paidAmount;

    private LocalDateTime paidOn;

    private String paymentMethod;

    private String paymentAccount;

    private String paymentNote;

    private BigDecimal paymentDue;
}
