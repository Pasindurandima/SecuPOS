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
public class PurchaseReturnItemResponse {
    private Long id;
    private ProductResponse product;
    private Integer purchasedQty;
    private Integer returnQty;
    private BigDecimal unitCost;
    private BigDecimal subtotal;
}
