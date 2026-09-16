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
public class DashboardOverview {
    private long totalProducts;
    private long totalCustomers;
    private long totalSuppliers;
    private BigDecimal totalSales;
    private BigDecimal totalPurchases;
    private BigDecimal totalExpenses;
    private BigDecimal invoiceDue;
    private BigDecimal netProfit;
    private BigDecimal totalPurchaseReturns;
    private BigDecimal totalPurchaseReturnsPaid;
    private BigDecimal totalSaleReturns;
    private BigDecimal totalSaleReturnsPaid;
    private List<DashboardMonth> monthlySales;
    private List<DashboardSale> recentSales;
}