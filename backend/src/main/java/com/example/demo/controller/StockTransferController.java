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
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.StockTransferRequest;
import com.example.demo.dto.StockTransferResponse;
import com.example.demo.service.StockTransferService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/stock-transfers")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class StockTransferController {

    private final StockTransferService stockTransferService;

    @PostMapping
    public ResponseEntity<ApiResponse<StockTransferResponse>> createStockTransfer(
            @Valid @RequestBody StockTransferRequest request) {
        StockTransferResponse response = stockTransferService.createStockTransfer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stock transfer created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockTransferResponse>>> getAllStockTransfers() {
        List<StockTransferResponse> response = stockTransferService.getAllStockTransfers();
        return ResponseEntity.ok(ApiResponse.success("Stock transfers retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockTransferResponse>> getStockTransfer(@PathVariable Long id) {
        StockTransferResponse response = stockTransferService.getStockTransfer(id);
        return ResponseEntity.ok(ApiResponse.success("Stock transfer retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StockTransferResponse>> updateStockTransfer(
            @PathVariable Long id,
            @Valid @RequestBody StockTransferRequest request) {
        StockTransferResponse response = stockTransferService.updateStockTransfer(id, request);
        return ResponseEntity.ok(ApiResponse.success("Stock transfer updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStockTransfer(@PathVariable Long id) {
        stockTransferService.deleteStockTransfer(id);
        return ResponseEntity.ok(ApiResponse.success("Stock transfer deleted successfully", null));
    }
}
