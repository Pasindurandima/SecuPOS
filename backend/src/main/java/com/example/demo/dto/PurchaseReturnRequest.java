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
public class PurchaseReturnRequest {

    @NotBlank(message = "Purchase invoice is required")
    private String purchaseInvoice;

    @NotBlank(message = "Supplier is required")
    private String supplier;

    @NotNull(message = "Return date is required")
    private LocalDateTime returnDate;

    private String returnNo;

    @NotBlank(message = "Return reason is required")
    private String returnReason;

    @NotBlank(message = "Refund type is required")
    private String refundType;

    private String notes;

    @NotNull(message = "Total is required")
    private BigDecimal total;

    @NotEmpty(message = "Purchase return must have at least one item")
    @Valid
    private List<PurchaseReturnItemRequest> items;
}
