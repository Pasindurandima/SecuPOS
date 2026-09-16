package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotationRequest {
    private Long customerId;
    private LocalDateTime quotationDate;
    private LocalDate expiryDate;
    private String terms;
    private String notes;
    private List<QuotationItemRequest> items;
}
