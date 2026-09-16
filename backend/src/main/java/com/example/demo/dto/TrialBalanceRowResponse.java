package com.example.demo.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialBalanceRowResponse {
    private String code;
    private String account;
    private BigDecimal debit;
    private BigDecimal credit;
}
