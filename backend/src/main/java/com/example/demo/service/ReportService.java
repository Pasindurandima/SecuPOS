package com.example.demo.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.ProfitLossReportDTO;
import com.example.demo.entity.Expense;
import com.example.demo.entity.Purchase;
import com.example.demo.entity.Sale;
import com.example.demo.repository.ExpenseRepository;
import com.example.demo.repository.PurchaseRepository;
import com.example.demo.repository.SaleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final ExpenseRepository expenseRepository;

    public ProfitLossReportDTO getProfitLossReport(LocalDateTime startDate, LocalDateTime endDate) {
        // Get all sales, purchases, and expenses within date range
        List<Sale> sales = saleRepository.findSalesByDateRange(startDate, endDate);
        List<Purchase> purchases = purchaseRepository.findPurchasesByDateRange(startDate, endDate);
        List<Expense> expenses = expenseRepository.findExpensesByDateRange(startDate, endDate);

        // Calculate total revenue from completed sales
        BigDecimal totalRevenue = sales.stream()
                .filter(sale -> sale.getStatus() == Sale.SaleStatus.COMPLETED)
                .map(Sale::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate total COGS from received purchases
        BigDecimal totalCOGS = purchases.stream()
                .filter(purchase -> purchase.getStatus() == Purchase.PurchaseStatus.RECEIVED)
                .map(Purchase::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate gross profit
        BigDecimal grossProfit = totalRevenue.subtract(totalCOGS);

        // Calculate total operating expenses
        BigDecimal totalOperatingExpenses = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate net profit
        BigDecimal netProfit = grossProfit.subtract(totalOperatingExpenses);

        // Calculate profit margin percentage
        Double profitMargin = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                ? netProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        // Calculate monthly data
        List<ProfitLossReportDTO.MonthlyData> monthlyData = calculateMonthlyData(sales, purchases, expenses);

        // Calculate expense breakdown by category
        Map<String, BigDecimal> expenseBreakdown = calculateExpenseBreakdown(expenses);

        return new ProfitLossReportDTO(
                totalRevenue,
                totalCOGS,
                grossProfit,
                totalOperatingExpenses,
                netProfit,
                profitMargin,
                monthlyData,
                expenseBreakdown
        );
    }

    private List<ProfitLossReportDTO.MonthlyData> calculateMonthlyData(
            List<Sale> sales, List<Purchase> purchases, List<Expense> expenses) {

        Map<String, ProfitLossReportDTO.MonthlyData> monthlyMap = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        // Process sales
        sales.stream()
                .filter(sale -> sale.getStatus() == Sale.SaleStatus.COMPLETED)
                .forEach(sale -> {
                    String month = sale.getSaleDate().format(formatter);
                    monthlyMap.putIfAbsent(month, new ProfitLossReportDTO.MonthlyData(month, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO));
                    ProfitLossReportDTO.MonthlyData data = monthlyMap.get(month);
                    data.setRevenue(data.getRevenue().add(sale.getTotal()));
                });

        // Process purchases (as COGS) and expenses
        purchases.stream()
                .filter(purchase -> purchase.getStatus() == Purchase.PurchaseStatus.RECEIVED)
                .forEach(purchase -> {
                    String month = purchase.getPurchaseDate().format(formatter);
                    monthlyMap.putIfAbsent(month, new ProfitLossReportDTO.MonthlyData(month, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO));
                    ProfitLossReportDTO.MonthlyData data = monthlyMap.get(month);
                    data.setExpenses(data.getExpenses().add(purchase.getTotal()));
                });

        expenses.forEach(expense -> {
            String month = expense.getExpenseDate().format(formatter);
            monthlyMap.putIfAbsent(month, new ProfitLossReportDTO.MonthlyData(month, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO));
            ProfitLossReportDTO.MonthlyData data = monthlyMap.get(month);
            data.setExpenses(data.getExpenses().add(expense.getAmount()));
        });

        // Calculate profit for each month
        monthlyMap.values().forEach(data -> {
            BigDecimal profit = data.getRevenue().subtract(data.getExpenses());
            data.setProfit(profit);
        });

        return new ArrayList<>(monthlyMap.values());
    }

    private Map<String, BigDecimal> calculateExpenseBreakdown(List<Expense> expenses) {
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        expense -> expense.getCategory(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
    }
}
