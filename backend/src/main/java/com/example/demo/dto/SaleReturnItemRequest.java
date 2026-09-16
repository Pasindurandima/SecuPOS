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
public class SaleReturnItemRequest {
    @NotNull private Long productId;
    @NotNull @Min(0) private Integer soldQty;
    @NotNull @Min(1) private Integer returnQty;
    @NotNull @DecimalMin(value = "0.0", inclusive = false) private BigDecimal unitPrice;
    @NotNull @DecimalMin(value = "0.0", inclusive = false) private BigDecimal subtotal;
}
