package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
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
public class StockAdjustmentRequest {

    @NotNull(message = "Adjustment date is required")
    private LocalDateTime adjustmentDate;

    @NotNull(message = "Location is required")
    private String location;

    @NotNull(message = "Adjustment type is required")
    private String adjustmentType; // NORMAL, ABNORMAL

    @NotNull(message = "Reason is required")
    private String reason; // DAMAGED_GOODS, STOCK_FOUND, EXPIRED_PRODUCTS, THEFT_LOSS, PHYSICAL_COUNT, OTHER

    @NotEmpty(message = "Stock adjustment must have at least one item")
    @Valid
    private List<StockAdjustmentItemRequest> items;

    private String notes;

    private String documentPath;
}
