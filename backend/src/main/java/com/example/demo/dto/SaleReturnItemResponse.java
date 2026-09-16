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
public class SaleReturnItemResponse {
    private Long id;
    private ProductResponse product;
    private Integer soldQty;
    private Integer returnQty;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
