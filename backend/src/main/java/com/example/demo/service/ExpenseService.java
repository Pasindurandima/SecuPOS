package com.example.demo.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.ExpenseRequest;
import com.example.demo.dto.ExpenseResponse;
import com.example.demo.entity.Expense;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ExpenseCategoryRepository;
import com.example.demo.repository.ExpenseRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.DtoMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        validateCategory(request.getCategory());
        validatePaymentMethod(request.getPaymentMethod());
        String username = SecurityContextHolder.getContext().getAuthentication() != null
            ? SecurityContextHolder.getContext().getAuthentication().getName() : "system";
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Expense expense = Expense.builder()
                .referenceNo(generateReferenceNo())
                .title(request.getTitle())
                .description(request.getDescription())
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate())
                .businessLocation(request.getBusinessLocation())
                .category(normalizeCategory(request.getCategory()))
                .paymentMethod(parsePaymentMethod(request.getPaymentMethod()))
                .paymentAccount(request.getPaymentAccount())
                .taxPercent(request.getTaxPercent())
                .taxAmount(request.getTaxAmount())
                .expenseContact(request.getExpenseContact())
                .additionalNotes(request.getAdditionalNotes())
                .documentUrl(request.getDocumentUrl())
                .user(user)
                .isActive(true)
                .build();

        Expense savedExpense = expenseRepository.save(expense);
        return dtoMapper.toExpenseResponse(savedExpense);
    }

    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
            if (!Boolean.TRUE.equals(expense.getIsActive())) throw new ResourceNotFoundException("Expense not found with id: " + id);
            validateCategory(request.getCategory());
            validatePaymentMethod(request.getPaymentMethod());

        expense.setTitle(request.getTitle());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setBusinessLocation(request.getBusinessLocation());
        expense.setCategory(normalizeCategory(request.getCategory()));
        expense.setPaymentMethod(parsePaymentMethod(request.getPaymentMethod()));
        expense.setPaymentAccount(request.getPaymentAccount());
        expense.setTaxPercent(request.getTaxPercent());
        expense.setTaxAmount(request.getTaxAmount());
        expense.setExpenseContact(request.getExpenseContact());
        expense.setAdditionalNotes(request.getAdditionalNotes());
        expense.setDocumentUrl(request.getDocumentUrl());

        Expense updatedExpense = expenseRepository.save(expense);
        return dtoMapper.toExpenseResponse(updatedExpense);
    }

    public ExpenseResponse getExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        return dtoMapper.toExpenseResponse(expense);
    }

    public List<ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAllOrderByDateDesc().stream()
                .map(dtoMapper::toExpenseResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return expenseRepository.findExpensesByDateRange(startDate, endDate).stream()
                .map(dtoMapper::toExpenseResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByCategory(String category) {
        return expenseRepository.findByCategory(normalizeCategory(category)).stream()
                .map(dtoMapper::toExpenseResponse)
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalExpensesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal total = expenseRepository.getTotalExpensesByDateRange(startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        expense.setIsActive(false);
        expenseRepository.save(expense);
    }

    private String generateReferenceNo() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "EXP" + timestamp;
    }

    private void validateCategory(String category) {
        String code = normalizeCategory(category);
        if (expenseCategoryRepository.findActiveByCode(code).isEmpty()) {
            throw new BadRequestException("Expense category does not exist or is inactive: " + code);
        }
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) throw new BadRequestException("Expense category is required");
        return category.trim().toUpperCase().replaceAll("[^A-Z0-9]+", "_");
    }

    private void validatePaymentMethod(String method) {
        parsePaymentMethod(method);
    }

    private Expense.PaymentMethod parsePaymentMethod(String method) {
        try {
            return Expense.PaymentMethod.valueOf(method.toUpperCase());
        } catch (RuntimeException ex) {
            throw new BadRequestException("Unsupported payment method: " + method);
        }
    }
}
