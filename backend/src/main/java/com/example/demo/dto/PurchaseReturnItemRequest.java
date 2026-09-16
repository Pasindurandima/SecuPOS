package com.example.demo.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseReturnItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Purchased quantity is required")
    @Min(value = 0, message = "Purchased quantity must be zero or greater")
    private Integer purchasedQty;

    @NotNull(message = "Returned quantity is required")
    @Min(value = 1, message = "Returned quantity must be at least 1")
    private Integer returnQty;

    @NotNull(message = "Unit cost is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit cost must be greater than 0")
    private BigDecimal unitCost;

    @NotNull(message = "Subtotal is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Subtotal must be greater than 0")
    private BigDecimal subtotal;
}
