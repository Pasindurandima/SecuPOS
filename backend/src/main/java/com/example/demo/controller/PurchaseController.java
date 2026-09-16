package com.example.demo.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.PurchasePaymentRequest;
import com.example.demo.dto.PurchaseRequest;
import com.example.demo.dto.PurchaseResponse;
import com.example.demo.service.PurchaseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/purchases")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseResponse>> createPurchase(@Valid @RequestBody PurchaseRequest request) {
        PurchaseResponse response = purchaseService.createPurchase(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Purchase created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseResponse>> getPurchase(@PathVariable Long id) {
        PurchaseResponse response = purchaseService.getPurchase(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseResponse>>> getAllPurchases() {
        List<PurchaseResponse> response = purchaseService.getAllPurchases();
        return ResponseEntity.ok(ApiResponse.success("Purchases retrieved successfully", response));
    }

    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<PurchaseResponse>>> getPurchasesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<PurchaseResponse> response = purchaseService.getPurchasesByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Purchases retrieved successfully", response));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<ApiResponse<List<PurchaseResponse>>> getPurchasesBySupplier(@PathVariable Long supplierId) {
        List<PurchaseResponse> response = purchaseService.getPurchasesBySupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success("Purchases retrieved successfully", response));
    }

    @GetMapping("/total")
    public ResponseEntity<ApiResponse<BigDecimal>> getTotalPurchasesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        BigDecimal total = purchaseService.getTotalPurchasesByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Total purchases calculated", total));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelPurchase(@PathVariable Long id) {
        purchaseService.cancelPurchase(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase cancelled successfully", null));
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<ApiResponse<PurchaseResponse>> recordPayment(@PathVariable Long id,
            @Valid @RequestBody PurchasePaymentRequest request) {
        PurchaseResponse response = purchaseService.recordPayment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Purchase payment recorded successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePurchase(@PathVariable Long id) {
        purchaseService.deletePurchase(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase deleted successfully", null));
    }
}
