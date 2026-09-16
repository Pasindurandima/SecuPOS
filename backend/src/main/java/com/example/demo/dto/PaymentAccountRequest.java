package com.example.demo.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
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
public class PaymentAccountRequest {
    @NotBlank private String name;
    private String accountNumber;
    @NotNull private String type;
    private String provider;
    private String businessLocation;
    @NotNull @DecimalMin("0.0") private BigDecimal openingBalance;
}
