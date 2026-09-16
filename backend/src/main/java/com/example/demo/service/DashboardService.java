package com.example.demo.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.DashboardMonth;
import com.example.demo.dto.DashboardOverview;
import com.example.demo.dto.DashboardSale;
import com.example.demo.dto.DashboardStats;
import com.example.demo.dto.EssentialsActivity;
import com.example.demo.dto.EssentialsOverview;
import com.example.demo.entity.Product;
import com.example.demo.entity.PurchaseReturn;
import com.example.demo.entity.Sale;
import com.example.demo.entity.SaleReturn;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.ExpenseRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.PurchaseRepository;
import com.example.demo.repository.PurchaseReturnRepository;
import com.example.demo.repository.SaleRepository;
import com.example.demo.repository.SaleReturnRepository;
import com.example.demo.repository.StockAdjustmentRepository;
import com.example.demo.repository.SupplierRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final ExpenseRepository expenseRepository;
    private final StockAdjustmentRepository stockAdjustmentRepository;
    private final PurchaseReturnRepository purchaseReturnRepository;
    private final SaleReturnRepository saleReturnRepository;

    public DashboardStats getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        
        // Today's date range
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime todayEnd = now.toLocalDate().atTime(LocalTime.MAX);
        
        // This month's date range
        LocalDateTime monthStart = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime monthEnd = now.withDayOfMonth(now.toLocalDate().lengthOfMonth()).toLocalDate().atTime(LocalTime.MAX);
        
        // This year's date range
        LocalDateTime yearStart = now.withDayOfYear(1).toLocalDate().atStartOfDay();
        LocalDateTime yearEnd = now.withDayOfYear(now.toLocalDate().lengthOfYear()).toLocalDate().atTime(LocalTime.MAX);

        // Get counts
        Long totalProducts = productRepository.count();
        Long lowStockProducts = (long) productRepository.findLowStockProducts().size();
        Long totalCustomers = customerRepository.count();
        Long totalSuppliers = supplierRepository.count();

        // Sales stats
        BigDecimal todaySales = getSafeValue(saleRepository.getTotalSalesByDateRange(todayStart, todayEnd));
        Long todaySalesCount = saleRepository.getCountByDateRange(todayStart, todayEnd);
        BigDecimal monthSales = getSafeValue(saleRepository.getTotalSalesByDateRange(monthStart, monthEnd));
        BigDecimal yearSales = getSafeValue(saleRepository.getTotalSalesByDateRange(yearStart, yearEnd));

        // Purchase stats
        BigDecimal todayPurchases = getSafeValue(purchaseRepository.getTotalPurchasesByDateRange(todayStart, todayEnd));
        BigDecimal monthPurchases = getSafeValue(purchaseRepository.getTotalPurchasesByDateRange(monthStart, monthEnd));
        BigDecimal yearPurchases = getSafeValue(purchaseRepository.getTotalPurchasesByDateRange(yearStart, yearEnd));

        // Expense stats
        BigDecimal todayExpenses = getSafeValue(expenseRepository.getTotalExpensesByDateRange(todayStart, todayEnd));
        BigDecimal monthExpenses = getSafeValue(expenseRepository.getTotalExpensesByDateRange(monthStart, monthEnd));
        BigDecimal yearExpenses = getSafeValue(expenseRepository.getTotalExpensesByDateRange(yearStart, yearEnd));

        // Calculate profit (Sales - Purchases - Expenses)
        BigDecimal todayProfit = todaySales.subtract(todayPurchases).subtract(todayExpenses);
        BigDecimal monthProfit = monthSales.subtract(monthPurchases).subtract(monthExpenses);
        BigDecimal yearProfit = yearSales.subtract(yearPurchases).subtract(yearExpenses);

        return DashboardStats.builder()
                .totalProducts(totalProducts)
                .lowStockProducts(lowStockProducts)
                .totalCustomers(totalCustomers)
                .totalSuppliers(totalSuppliers)
                .todaySales(todaySales)
                .todaySalesCount(todaySalesCount)
                .monthSales(monthSales)
                .yearSales(yearSales)
                .todayPurchases(todayPurchases)
                .monthPurchases(monthPurchases)
                .yearPurchases(yearPurchases)
                .todayExpenses(todayExpenses)
                .monthExpenses(monthExpenses)
                .yearExpenses(yearExpenses)
                .todayProfit(todayProfit)
                .monthProfit(monthProfit)
                .yearProfit(yearProfit)
                .build();
    }

    public DashboardOverview getDashboardOverview() {
        List<Sale> sales = saleRepository.findAllOrderByDateDesc();
        BigDecimal totalSales = sales.stream().filter(sale -> sale.getStatus() == Sale.SaleStatus.COMPLETED).map(Sale::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPurchases = purchaseRepository.findAll().stream().map(purchase -> purchase.getTotal()).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpenses = expenseRepository.findAll().stream().filter(expense -> Boolean.TRUE.equals(expense.getIsActive())).map(expense -> getSafeValue(expense.getAmount()).add(getSafeValue(expense.getTaxAmount()))).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal invoiceDue = sales.stream().filter(sale -> sale.getStatus() == Sale.SaleStatus.COMPLETED).map(sale -> getSafeValue(sale.getTotal()).subtract(getSafeValue(sale.getPaidAmount())).max(BigDecimal.ZERO)).reduce(BigDecimal.ZERO, BigDecimal::add);
        List<DashboardMonth> monthlySales = java.util.stream.IntStream.range(0, 12).mapToObj(month -> new DashboardMonth(java.time.Month.of(month + 1).name().substring(0, 3), sales.stream().filter(sale -> sale.getStatus() == Sale.SaleStatus.COMPLETED && sale.getSaleDate() != null && sale.getSaleDate().getYear() == LocalDateTime.now().getYear() && sale.getSaleDate().getMonthValue() == month + 1).map(Sale::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add))).collect(Collectors.toList());
        List<PurchaseReturn> purchaseReturns = purchaseReturnRepository.findAllByOrderByReturnDateDesc();
        List<SaleReturn> saleReturns = saleReturnRepository.findAllByOrderByReturnDateDesc();
        return DashboardOverview.builder()
                .totalProducts(productRepository.count()).totalCustomers(customerRepository.count()).totalSuppliers(supplierRepository.count())
                .totalSales(totalSales).totalPurchases(totalPurchases).totalExpenses(totalExpenses).invoiceDue(invoiceDue).netProfit(totalSales.subtract(totalPurchases).subtract(totalExpenses))
                .totalPurchaseReturns(purchaseReturns.stream().map(PurchaseReturn::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add)).totalPurchaseReturnsPaid(null)
                .totalSaleReturns(saleReturns.stream().map(SaleReturn::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add)).totalSaleReturnsPaid(null)
                .monthlySales(monthlySales).recentSales(sales.stream().limit(10).map(this::toDashboardSale).collect(Collectors.toList())).build();
    }

    private DashboardSale toDashboardSale(Sale sale) {
        BigDecimal total = getSafeValue(sale.getTotal());
        BigDecimal paid = getSafeValue(sale.getPaidAmount());
        String status = paid.compareTo(BigDecimal.ZERO) <= 0 ? "PENDING" : paid.compareTo(total) >= 0 ? "PAID" : "PARTIAL";
        return new DashboardSale(sale.getId(), sale.getInvoiceNumber(), sale.getSaleDate(), sale.getCustomer() == null ? "Walk-in Customer" : sale.getCustomer().getName(), total, paid, status, sale.getPaymentMethod() == null ? "CASH" : sale.getPaymentMethod().name());
    }

            public EssentialsOverview getEssentialsOverview() {
            LocalDateTime todayStart = LocalDateTime.now().toLocalDate().atStartOfDay();
            LocalDateTime todayEnd = LocalDateTime.now().toLocalDate().atTime(LocalTime.MAX);
            List<Product> lowStockProducts = productRepository.findLowStockProducts();
            BigDecimal todaySales = getSafeValue(saleRepository.getTotalSalesByDateRange(todayStart, todayEnd));

            List<EssentialsActivity> activities = new ArrayList<>();
            saleRepository.findAllOrderByDateDesc().stream().limit(10).forEach(sale -> activities.add(new EssentialsActivity(
                "sale", "Sale completed", sale.getInvoiceNumber(), sale.getSaleDate(), sale.getTotal())));
            productRepository.findAllActiveProducts().stream().limit(10).forEach(product -> activities.add(new EssentialsActivity(
                "product", "Product added", product.getName() + " - SKU: " + product.getSku(), product.getCreatedAt(), null)));
            expenseRepository.findAllOrderByDateDesc().stream().limit(10).forEach(expense -> activities.add(new EssentialsActivity(
                "expense", "Expense recorded", expense.getTitle(), expense.getExpenseDate(), expense.getAmount())));
            stockAdjustmentRepository.findAll().stream().limit(10).forEach(adjustment -> activities.add(new EssentialsActivity(
                "stock", "Stock adjusted", adjustment.getTotalQuantity() + " items updated", adjustment.getAdjustmentDate(), adjustment.getTotalAmount())));

            return EssentialsOverview.builder()
                .totalProducts(productRepository.count())
                .totalCustomers(customerRepository.count())
                .lowStockCount(lowStockProducts.size())
                .todaySalesCount(saleRepository.getCountByDateRange(todayStart, todayEnd))
                .todaySales(todaySales)
                .lowStockProducts(lowStockProducts.stream().map(Product::getName).collect(Collectors.toList()))
                .recentActivities(activities.stream()
                    .filter(activity -> activity.getDate() != null)
                    .sorted(Comparator.comparing(EssentialsActivity::getDate).reversed())
                    .limit(8)
                    .collect(Collectors.toList()))
                .build();
            }

    private BigDecimal getSafeValue(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
