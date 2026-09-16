package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentResponse {
    
    private Long id;
    private String referenceNumber;
    private LocalDateTime adjustmentDate;
    private String location;
    private String adjustmentType;
    private String reason;
    private List<StockAdjustmentItemResponse> items;
    private BigDecimal totalAmount;
    private Integer totalQuantity;
    private String notes;
    private String documentPath;
    private String userName;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
