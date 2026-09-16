package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentRequest {
    @NotBlank private String invoiceNumber;
    @NotBlank private String carrier;
    private String trackingNumber;
    @NotNull private LocalDate shipmentDate;
    private LocalDate expectedDelivery;
    @NotBlank private String shippingAddress;
    @NotNull @DecimalMin(value = "0.0", inclusive = true) private BigDecimal shippingCost;
    @NotNull @Min(0) private Integer itemCount;
    private String notes;
}
