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
public class ExpenseResponse {
    
    private Long id;
    private String referenceNo;
    private String title;
    private String description;
    private BigDecimal amount;
    private LocalDateTime expenseDate;
    private String businessLocation;
    private String category;
    private String paymentMethod;
    private String paymentAccount;
    private BigDecimal taxPercent;
    private BigDecimal taxAmount;
    private String expenseContact;
    private String additionalNotes;
    private String documentUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
