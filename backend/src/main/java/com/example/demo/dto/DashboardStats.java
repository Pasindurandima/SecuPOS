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
public class DashboardStats {
    
    private Long totalProducts;
    private Long lowStockProducts;
    private Long totalCustomers;
    private Long totalSuppliers;
    
    private BigDecimal todaySales;
    private Long todaySalesCount;
    private BigDecimal monthSales;
    private BigDecimal yearSales;
    
    private BigDecimal todayPurchases;
    private BigDecimal monthPurchases;
    private BigDecimal yearPurchases;
    
    private BigDecimal todayExpenses;
    private BigDecimal monthExpenses;
    private BigDecimal yearExpenses;
    
    private BigDecimal todayProfit;
    private BigDecimal monthProfit;
    private BigDecimal yearProfit;
}
