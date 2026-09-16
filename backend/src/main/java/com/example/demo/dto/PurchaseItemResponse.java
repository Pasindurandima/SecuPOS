package com.example.demo.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseItemResponse {
    
    private Long id;
    private ProductResponse product;
    private Integer quantity;
    private BigDecimal unitCostBeforeDiscount;
    private BigDecimal discountPercent;
    private BigDecimal unitCostBeforeTax;
    private BigDecimal lineTotal;
    private BigDecimal profitMarginPercent;
    private BigDecimal unitSellingPrice;
    private BigDecimal unitCost;
    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal total;
}
