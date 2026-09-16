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
public class SaleResponse {
    
    private Long id;
    private String invoiceNumber;
    private CustomerResponse customer;
    private LocalDateTime saleDate;
    private List<SaleItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal total;
    private BigDecimal paidAmount;
    private BigDecimal changeAmount;
    private String paymentMethod;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
}
