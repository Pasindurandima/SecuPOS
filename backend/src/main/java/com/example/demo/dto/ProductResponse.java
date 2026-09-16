package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    
    private Long id;
    private String name;
    private String sku;
    private String description;
    private CategoryResponse category;
    private BrandResponse brand;
    private String unit;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer quantity;
    private Integer alertQuantity;
    private String barcode;
    private String imageUrl;
    private BigDecimal taxRate;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
