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
import com.example.demo.dto.PurchaseReturnRequest;
import com.example.demo.dto.PurchaseReturnResponse;
import com.example.demo.service.PurchaseReturnService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/purchase-returns")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PurchaseReturnController {

    private final PurchaseReturnService purchaseReturnService;

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseReturnResponse>> createPurchaseReturn(@Valid @RequestBody PurchaseReturnRequest request) {
        PurchaseReturnResponse response = purchaseReturnService.createPurchaseReturn(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Purchase return created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseReturnResponse>>> getAllPurchaseReturns() {
        List<PurchaseReturnResponse> response = purchaseReturnService.getAllPurchaseReturns();
        return ResponseEntity.ok(ApiResponse.success("Purchase returns retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseReturnResponse>> getPurchaseReturn(@PathVariable Long id) {
        PurchaseReturnResponse response = purchaseReturnService.getPurchaseReturn(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase return retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseReturnResponse>> updatePurchaseReturn(@PathVariable Long id,
            @Valid @RequestBody PurchaseReturnRequest request) {
        PurchaseReturnResponse response = purchaseReturnService.updatePurchaseReturn(id, request);
        return ResponseEntity.ok(ApiResponse.success("Purchase return updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseReturn(@PathVariable Long id) {
        purchaseReturnService.deletePurchaseReturn(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase return deleted successfully", null));
    }
}
