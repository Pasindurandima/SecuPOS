package com.example.demo.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "purchases")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Purchase extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String purchaseNumber;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    private String supplierAddress;

    private String referenceNo;

    @Column(nullable = false)
    private LocalDateTime purchaseDate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PurchaseStatus status = PurchaseStatus.RECEIVED;

    private String businessLocation;

    private Integer payTerm; // Payment term in days

    private String attachedDocumentPath;

    @Builder.Default
    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseItem> items = new ArrayList<>();

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tax;

    @Column(precision = 5, scale = 2)
    private BigDecimal taxPercent;

    @Column(precision = 10, scale = 2)
    private BigDecimal shippingCharges;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(length = 1000)
    private String additionalNotes;

    // Payment information
    @Column(precision = 10, scale = 2)
    private BigDecimal paidAmount;

    private LocalDateTime paidOn;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String paymentAccount;

    private String paymentNote;

    @Column(precision = 10, scale = 2)
    private BigDecimal paymentDue;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public enum PurchaseStatus {
        PENDING, RECEIVED, ORDERED, CANCELLED
    }

    public enum DiscountType {
        FIXED, PERCENTAGE
    }

    public enum PaymentMethod {
        CASH, CARD, BANK_TRANSFER, CHEQUE
    }
}
