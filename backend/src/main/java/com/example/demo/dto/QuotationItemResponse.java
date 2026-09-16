package com.example.demo.dto;

import com.example.demo.entity.QuotationItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotationItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double unitPrice;
    private Double taxRate;
    private Double subtotal;
    private Double taxAmount;
    private Double totalAmount;

    // Constructor from entity
    public QuotationItemResponse(QuotationItem item) {
        this.id = item.getId();
        this.productId = item.getProduct().getId();
        this.productName = item.getProduct().getName();
        this.quantity = item.getQuantity();
        this.unitPrice = item.getUnitPrice();
        this.taxRate = item.getTaxRate();
        this.subtotal = item.getSubtotal();
        this.taxAmount = item.getTaxAmount();
        this.totalAmount = item.getTotalAmount();
    }
}
