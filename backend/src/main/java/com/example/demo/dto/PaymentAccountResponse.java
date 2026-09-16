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
public class PaymentAccountResponse {
    private Long id;
    private String name;
    private String accountNumber;
    private String type;
    private String provider;
    private String businessLocation;
    private BigDecimal openingBalance;
    private BigDecimal totalReceipts;
    private BigDecimal totalPayments;
    private BigDecimal balance;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
