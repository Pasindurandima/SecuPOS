package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfitLossReportDTO {
    private BigDecimal totalRevenue;
    private BigDecimal totalCOGS;
    private BigDecimal grossProfit;
    private BigDecimal totalOperatingExpenses;
    private BigDecimal netProfit;
    private Double profitMargin;
    private List<MonthlyData> monthlyData;
    private Map<String, BigDecimal> expenseBreakdown;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private String month;
        private BigDecimal revenue;
        private BigDecimal expenses;
        private BigDecimal profit;
    }
}
