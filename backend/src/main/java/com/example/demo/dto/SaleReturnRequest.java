package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleReturnRequest {
    @NotBlank private String saleInvoice;
    private String customer;
    @NotNull private LocalDateTime returnDate;
    @NotBlank private String returnReason;
    @NotBlank private String refundType;
    private String notes;
    @NotNull private BigDecimal total;
    @NotEmpty @Valid private List<SaleReturnItemRequest> items;
}
