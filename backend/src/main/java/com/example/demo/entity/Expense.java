package com.example.demo.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "expenses")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Expense extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String referenceNo;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDateTime expenseDate;

    @Column(nullable = false)
    private String businessLocation;

    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    private String paymentAccount;

    @Column(precision = 5, scale = 2)
    private BigDecimal taxPercent;

    @Column(precision = 10, scale = 2)
    private BigDecimal taxAmount;

    private String expenseContact;

    @Column(length = 2000)
    private String additionalNotes;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String documentUrl;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    public enum PaymentMethod {
        CASH, BANK_TRANSFER, CREDIT_CARD, DEBIT_CARD, CHECK, ONLINE_PAYMENT
    }
}
