package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quotation_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotationItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id", nullable = false)
    private Quotation quotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "tax_rate")
    private Double taxRate = 0.0;

    @Column(name = "subtotal", nullable = false)
    private Double subtotal;

    @Column(name = "tax_amount", nullable = false)
    private Double taxAmount;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    // Calculate amounts before persisting
    @PrePersist
    @PreUpdate
    protected void calculateAmounts() {
        this.subtotal = this.quantity * this.unitPrice;
        this.taxAmount = this.subtotal * (this.taxRate / 100);
        this.totalAmount = this.subtotal + this.taxAmount;
    }
}
