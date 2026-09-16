package com.example.demo.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "purchase_returns")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseReturn extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String returnNumber;

    @Column(nullable = false)
    private String purchaseInvoice;

    @Column(nullable = false)
    private String supplier;

    @Column(nullable = false)
    private LocalDateTime returnDate;

    @Column(nullable = false)
    private String returnReason;

    @Column(nullable = false)
    private String refundType;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Builder.Default
    @OneToMany(mappedBy = "purchaseReturn", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseReturnItem> items = new ArrayList<>();
}
