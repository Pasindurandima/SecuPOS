package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotationItemRequest {
    private Long productId;
    private Integer quantity;
    private Double unitPrice;
    private Double taxRate;
}
