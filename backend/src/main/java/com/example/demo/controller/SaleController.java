package com.example.demo.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.SaleRequest;
import com.example.demo.dto.SaleResponse;
import com.example.demo.service.SaleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SaleController {

    private final SaleService saleService;

    @PostMapping
    public ResponseEntity<ApiResponse<SaleResponse>> createSale(@Valid @RequestBody SaleRequest request) {
        SaleResponse response = saleService.createSale(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sale created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SaleResponse>> getSale(@PathVariable Long id) {
        SaleResponse response = saleService.getSale(id);
        return ResponseEntity.ok(ApiResponse.success("Sale retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SaleResponse>>> getAllSales() {
        List<SaleResponse> response = saleService.getAllSales();
        return ResponseEntity.ok(ApiResponse.success("Sales retrieved successfully", response));
    }

    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<SaleResponse>>> getSalesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<SaleResponse> response = saleService.getSalesByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Sales retrieved successfully", response));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<SaleResponse>>> getSalesByCustomer(@PathVariable Long customerId) {
        List<SaleResponse> response = saleService.getSalesByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success("Sales retrieved successfully", response));
    }

    @GetMapping("/total")
    public ResponseEntity<ApiResponse<BigDecimal>> getTotalSalesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        BigDecimal total = saleService.getTotalSalesByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Total sales calculated", total));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getSalesCountByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Long count = saleService.getSalesCountByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Sales count retrieved", count));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelSale(@PathVariable Long id) {
        saleService.cancelSale(id);
        return ResponseEntity.ok(ApiResponse.success("Sale cancelled successfully", null));
    }
}
