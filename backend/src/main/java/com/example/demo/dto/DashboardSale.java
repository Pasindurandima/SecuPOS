package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardSale {
    private Long id;
    private String invoiceNumber;
    private LocalDateTime saleDate;
    private String customerName;
    private BigDecimal total;
    private BigDecimal paidAmount;
    private String paymentStatus;
    private String paymentMethod;
}