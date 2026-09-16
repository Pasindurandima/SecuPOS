package com.example.demo.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.dto.*;
import com.example.demo.service.SaleReturnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/sale-returns")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SaleReturnController {
    private final SaleReturnService saleReturnService;

    @PostMapping
    public ResponseEntity<ApiResponse<SaleReturnResponse>> create(@Valid @RequestBody SaleReturnRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Sale return created successfully", saleReturnService.create(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SaleReturnResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Sale returns retrieved successfully", saleReturnService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SaleReturnResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Sale return retrieved successfully", saleReturnService.getById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        saleReturnService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Sale return deleted successfully", null));
    }
}
