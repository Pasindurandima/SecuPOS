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
public class PurchaseReturnResponse {
    private Long id;
    private String returnNumber;
    private String purchaseInvoice;
    private String supplier;
    private LocalDateTime returnDate;
    private String returnReason;
    private String refundType;
    private String notes;
    private BigDecimal total;
    private List<PurchaseReturnItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
