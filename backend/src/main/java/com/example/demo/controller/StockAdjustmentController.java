package com.example.demo.controller;

import java.util.List;

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
import com.example.demo.dto.StockAdjustmentRequest;
import com.example.demo.dto.StockAdjustmentResponse;
import com.example.demo.service.StockAdjustmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/stock-adjustments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class StockAdjustmentController {

    private final StockAdjustmentService stockAdjustmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<StockAdjustmentResponse>> createStockAdjustment(
            @Valid @RequestBody StockAdjustmentRequest request) {
        StockAdjustmentResponse response = stockAdjustmentService.createStockAdjustment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stock adjustment created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockAdjustmentResponse>> getStockAdjustment(@PathVariable Long id) {
        StockAdjustmentResponse response = stockAdjustmentService.getStockAdjustment(id);
        return ResponseEntity.ok(ApiResponse.success("Stock adjustment retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockAdjustmentResponse>>> getAllStockAdjustments(
            @RequestParam(required = false) String location) {
        List<StockAdjustmentResponse> response;
        if (location != null && !location.isEmpty()) {
            response = stockAdjustmentService.getStockAdjustmentsByLocation(location);
        } else {
            response = stockAdjustmentService.getAllStockAdjustments();
        }
        return ResponseEntity.ok(ApiResponse.success("Stock adjustments retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StockAdjustmentResponse>> updateStockAdjustment(
            @PathVariable Long id,
            @Valid @RequestBody StockAdjustmentRequest request) {
        StockAdjustmentResponse response = stockAdjustmentService.updateStockAdjustment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Stock adjustment updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStockAdjustment(@PathVariable Long id) {
        stockAdjustmentService.deleteStockAdjustment(id);
        return ResponseEntity.ok(ApiResponse.success("Stock adjustment deleted successfully", null));
    }
}
