package com.example.demo.dto;

import com.example.demo.entity.Quotation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotationResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private LocalDateTime quotationDate;
    private LocalDate expiryDate;
    private String terms;
    private String notes;
    private Double totalAmount;
    private String status;
    private List<QuotationItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor from entity
    public QuotationResponse(Quotation quotation) {
        this.id = quotation.getId();
        this.customerId = quotation.getCustomer().getId();
        this.customerName = quotation.getCustomer().getName();
        this.quotationDate = quotation.getQuotationDate();
        this.expiryDate = quotation.getExpiryDate();
        this.terms = quotation.getTerms();
        this.notes = quotation.getNotes();
        this.totalAmount = quotation.getTotalAmount();
        this.status = quotation.getStatus().name();
        this.items = quotation.getItems().stream()
                .map(QuotationItemResponse::new)
                .collect(Collectors.toList());
        this.createdAt = quotation.getCreatedAt();
        this.updatedAt = quotation.getUpdatedAt();
    }
}
