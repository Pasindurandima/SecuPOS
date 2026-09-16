package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReportResponse {
    private BigDecimal totalReceipts;
    private BigDecimal totalPayments;
    private BigDecimal totalBalance;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private BigDecimal totalSales;
    private BigDecimal totalPurchases;
    private BigDecimal totalExpenses;
    private BigDecimal inventoryValue;
    private BigDecimal accountsPayable;
    private BigDecimal netCashFromOperating;
    private BigDecimal netCashFromInvesting;
    private BigDecimal netCashFromFinancing;
    private List<PaymentTransactionResponse> transactions;
    private List<TrialBalanceRowResponse> trialBalance;
}
