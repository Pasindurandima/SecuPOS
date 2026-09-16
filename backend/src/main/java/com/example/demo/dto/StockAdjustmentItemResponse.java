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
public class StockAdjustmentItemResponse {
    
    private Long id;
    private ProductResponse product;
    private String adjustmentType;
    private Integer currentStock;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal subtotal;
}
