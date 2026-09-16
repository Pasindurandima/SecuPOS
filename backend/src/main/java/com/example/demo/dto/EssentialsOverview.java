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
public class EssentialsOverview {
    private long totalProducts;
    private long totalCustomers;
    private long lowStockCount;
    private long todaySalesCount;
    private BigDecimal todaySales;
    private List<String> lowStockProducts;
    private List<EssentialsActivity> recentActivities;
}