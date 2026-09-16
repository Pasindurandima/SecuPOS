package com.example.demo.service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.ExpenseCategoryRequest;
import com.example.demo.dto.ExpenseCategoryResponse;
import com.example.demo.entity.ExpenseCategory;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ExpenseCategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExpenseCategoryService {
    private final ExpenseCategoryRepository repository;

    @Transactional(readOnly = true)
    public List<ExpenseCategoryResponse> getAll() {
        return repository.findAllActive().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ExpenseCategoryResponse create(ExpenseCategoryRequest request) {
        String name = request.getName().trim();
        String code = normalizeCode(request.getCode());
        validateUnique(name, code, null);
        ExpenseCategory category = ExpenseCategory.builder()
                .name(name).code(code).description(normalize(request.getDescription())).build();
        return toResponse(repository.save(category));
    }

    @Transactional
    public ExpenseCategoryResponse update(Long id, ExpenseCategoryRequest request) {
        ExpenseCategory category = repository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense category not found with id: " + id));
        String name = request.getName().trim();
        String code = normalizeCode(request.getCode());
        validateUnique(name, code, id);
        category.setName(name);
        category.setCode(code);
        category.setDescription(normalize(request.getDescription()));
        return toResponse(repository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        ExpenseCategory category = repository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense category not found with id: " + id));
        category.setIsActive(false);
        repository.save(category);
    }

    private void validateUnique(String name, String code, Long currentId) {
        boolean nameExists = currentId == null ? repository.existsByNameIgnoreCase(name) : repository.existsByNameIgnoreCaseAndIdNot(name, currentId);
        boolean codeExists = currentId == null ? repository.existsByCodeIgnoreCase(code) : repository.existsByCodeIgnoreCaseAndIdNot(code, currentId);
        if (nameExists) throw new BadRequestException("Expense category name already exists: " + name);
        if (codeExists) throw new BadRequestException("Expense category code already exists: " + code);
    }

    private String normalizeCode(String code) {
        if (code == null || code.isBlank()) throw new BadRequestException("Category code is required");
        return code.trim().toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]+", "_");
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ExpenseCategoryResponse toResponse(ExpenseCategory category) {
        return ExpenseCategoryResponse.builder()
                .id(category.getId()).name(category.getName()).code(category.getCode())
                .description(category.getDescription()).isActive(category.getIsActive())
                .createdAt(category.getCreatedAt()).updatedAt(category.getUpdatedAt()).build();
    }
}
