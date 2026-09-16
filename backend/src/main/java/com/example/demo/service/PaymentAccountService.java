package com.example.demo.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.PaymentAccountRequest;
import com.example.demo.dto.PaymentAccountResponse;
import com.example.demo.dto.PaymentReportResponse;
import com.example.demo.dto.PaymentTransactionResponse;
import com.example.demo.dto.TrialBalanceRowResponse;
import com.example.demo.entity.Expense;
import com.example.demo.entity.PaymentAccount;
import com.example.demo.entity.Purchase;
import com.example.demo.entity.Sale;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ExpenseRepository;
import com.example.demo.repository.PaymentAccountRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.PurchaseRepository;
import com.example.demo.repository.SaleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentAccountService {
    private final PaymentAccountRepository accountRepository;
    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final ExpenseRepository expenseRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<PaymentAccountResponse> getAccounts() {
        return accountRepository.findAllActive().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PaymentAccountResponse create(PaymentAccountRequest request) {
        String name = request.getName().trim();
        if (accountRepository.existsByNameIgnoreCase(name)) throw new BadRequestException("Payment account already exists: " + name);
        PaymentAccount account = PaymentAccount.builder().name(name).accountNumber(normalize(request.getAccountNumber()))
                .type(parseType(request.getType())).provider(normalize(request.getProvider()))
                .businessLocation(normalize(request.getBusinessLocation())).openingBalance(request.getOpeningBalance()).build();
        return toResponse(Objects.requireNonNull(accountRepository.save(account)));
    }

    @Transactional
    public PaymentAccountResponse update(Long id, PaymentAccountRequest request) {
        PaymentAccount account = accountRepository.findActiveById(id).orElseThrow(() -> new ResourceNotFoundException("Payment account not found"));
        String name = request.getName().trim();
        if (accountRepository.existsByNameIgnoreCaseAndIdNot(name, id)) throw new BadRequestException("Payment account already exists: " + name);
        account.setName(name); account.setAccountNumber(normalize(request.getAccountNumber())); account.setType(parseType(request.getType()));
        account.setProvider(normalize(request.getProvider())); account.setBusinessLocation(normalize(request.getBusinessLocation()));
        account.setOpeningBalance(request.getOpeningBalance());
        return toResponse(Objects.requireNonNull(accountRepository.save(account)));
    }

    @Transactional
    public void delete(Long id) {
        PaymentAccount account = accountRepository.findActiveById(id).orElseThrow(() -> new ResourceNotFoundException("Payment account not found"));
        account.setIsActive(false); accountRepository.save(account);
    }

    @Transactional(readOnly = true)
    public PaymentReportResponse report(LocalDateTime from, LocalDateTime to, String location) {
        LocalDateTime start = from == null ? LocalDateTime.of(1970, 1, 1, 0, 0) : from;
        LocalDateTime end = to == null ? LocalDateTime.now() : to;
        List<PaymentTransactionResponse> transactions = new ArrayList<>();
        BigDecimal sales = BigDecimal.ZERO, purchases = BigDecimal.ZERO, expenses = BigDecimal.ZERO;

        for (Sale sale : saleRepository.findSalesByDateRange(start, end)) {
            if (sale.getStatus() != Sale.SaleStatus.COMPLETED || !matchesLocation(location, null)) continue;
            BigDecimal amount = nz(sale.getPaidAmount()).min(nz(sale.getTotal()));
            sales = sales.add(amount);
            transactions.add(transaction(sale.getSaleDate(), paymentAccountName(sale.getPaymentMethod().name()), "RECEIPT", sale.getInvoiceNumber(), "Sale receipt", BigDecimal.ZERO, amount));
        }
        for (Purchase purchase : purchaseRepository.findPurchasesByDateRange(start, end)) {
            if (purchase.getStatus() == Purchase.PurchaseStatus.CANCELLED || !matchesLocation(location, purchase.getBusinessLocation())) continue;
            BigDecimal amount = nz(purchase.getPaidAmount());
            purchases = purchases.add(amount);
            if (amount.signum() > 0) transactions.add(transaction(purchase.getPurchaseDate(), normalizeAccount(purchase.getPaymentAccount(), purchase.getPaymentMethod() == null ? null : purchase.getPaymentMethod().name()), "PAYMENT", purchase.getPurchaseNumber(), "Purchase payment", amount, BigDecimal.ZERO));
        }
        for (Expense expense : expenseRepository.findExpensesByDateRange(start, end)) {
            if (!matchesLocation(location, expense.getBusinessLocation())) continue;
            BigDecimal amount = nz(expense.getAmount()).add(nz(expense.getTaxAmount()));
            expenses = expenses.add(amount);
            transactions.add(transaction(expense.getExpenseDate(), normalizeAccount(expense.getPaymentAccount(), expense.getPaymentMethod().name()), "PAYMENT", expense.getReferenceNo(), expense.getTitle(), amount, BigDecimal.ZERO));
        }

        transactions.sort(Comparator.comparing(PaymentTransactionResponse::getDate));
        BigDecimal opening = accountRepository.findAllActive().stream().map(PaymentAccount::getOpeningBalance).map(this::nz).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal receipts = sales;
        BigDecimal payments = purchases.add(expenses);
        BigDecimal closing = opening.add(receipts).subtract(payments);
        BigDecimal inventory = productRepository.findAllActiveProducts().stream().map(p -> {
            Integer quantity = p.getQuantity();
            return nz(p.getCostPrice()).multiply(BigDecimal.valueOf(quantity == null ? 0 : quantity));
        }).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal operating = receipts.subtract(payments);
        PaymentReportResponse response = PaymentReportResponse.builder().openingBalance(opening).totalReceipts(receipts).totalPayments(payments).totalBalance(closing).closingBalance(closing)
                .totalSales(sales).totalPurchases(purchases).totalExpenses(expenses).inventoryValue(inventory).accountsPayable(BigDecimal.ZERO)
                .netCashFromOperating(operating).netCashFromInvesting(BigDecimal.ZERO).netCashFromFinancing(BigDecimal.ZERO)
                .transactions(withBalances(transactions, opening)).trialBalance(trialRows(sales, purchases, expenses, inventory, closing)).build();
        return response;
    }

    private List<PaymentTransactionResponse> withBalances(List<PaymentTransactionResponse> rows, BigDecimal opening) {
        BigDecimal balance = opening;
        for (PaymentTransactionResponse row : rows) { balance = balance.add(row.getCredit()).subtract(row.getDebit()); row.setBalance(balance); }
        return rows;
    }

    private List<TrialBalanceRowResponse> trialRows(BigDecimal sales, BigDecimal purchases, BigDecimal expenses, BigDecimal inventory, BigDecimal cash) {
        List<TrialBalanceRowResponse> rows = new ArrayList<>();
        rows.add(row("1000", "Cash and payment accounts", cash, BigDecimal.ZERO));
        rows.add(row("1200", "Inventory", inventory, BigDecimal.ZERO));
        rows.add(row("4000", "Sales revenue", BigDecimal.ZERO, sales));
        rows.add(row("5000", "Purchases", purchases, BigDecimal.ZERO));
        rows.add(row("5100", "Operating expenses", expenses, BigDecimal.ZERO));
        return rows;
    }

    private TrialBalanceRowResponse row(String code, String account, BigDecimal debit, BigDecimal credit) { return TrialBalanceRowResponse.builder().code(code).account(account).debit(debit).credit(credit).build(); }
    private PaymentTransactionResponse transaction(LocalDateTime date, String account, String type, String reference, String description, BigDecimal debit, BigDecimal credit) { return PaymentTransactionResponse.builder().date(date).account(account).type(type).reference(reference).description(description).debit(debit).credit(credit).balance(BigDecimal.ZERO).build(); }
    private PaymentAccountResponse toResponse(PaymentAccount account) { PaymentReportResponse report = report(null, null, account.getBusinessLocation()); return PaymentAccountResponse.builder().id(account.getId()).name(account.getName()).accountNumber(account.getAccountNumber()).type(account.getType().name()).provider(account.getProvider()).businessLocation(account.getBusinessLocation()).openingBalance(nz(account.getOpeningBalance())).totalReceipts(report.getTotalReceipts()).totalPayments(report.getTotalPayments()).balance(nz(account.getOpeningBalance()).add(report.getTotalReceipts()).subtract(report.getTotalPayments())).isActive(account.getIsActive()).createdAt(account.getCreatedAt()).updatedAt(account.getUpdatedAt()).build(); }
    private PaymentAccount.AccountType parseType(String type) { try { return PaymentAccount.AccountType.valueOf(type.toUpperCase(Locale.ROOT)); } catch (RuntimeException ex) { throw new BadRequestException("Unsupported payment account type: " + type); } }
    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private String normalizeAccount(String account, String fallback) { return normalize(account) == null ? fallback : account; }
    private String paymentAccountName(String method) { return method == null ? "UNASSIGNED" : method; }
    private boolean matchesLocation(String selected, String actual) { return selected == null || selected.isBlank() || selected.equals(actual); }
    private BigDecimal nz(BigDecimal value) { return value == null ? BigDecimal.ZERO : value; }
}
