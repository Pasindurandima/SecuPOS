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
public class StockTransferResponse {
    private Long id;
    private String transferNumber;
    private LocalDateTime transferDate;
    private String fromLocation;
    private String toLocation;
    private String status;
    private List<StockTransferItemResponse> items;
    private BigDecimal totalAmount;
    private Integer totalQuantity;
    private String userName;
    private Long userId;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
