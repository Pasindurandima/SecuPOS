package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.LabelPrintRequest;
import com.example.demo.dto.LabelPrintResponse;
import com.example.demo.service.LabelPrintService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/label-prints")
@RequiredArgsConstructor
public class LabelPrintController {

    private final LabelPrintService labelPrintService;

    @PostMapping
    public ResponseEntity<ApiResponse> createLabelPrint(@RequestBody LabelPrintRequest request) {
        try {
            LabelPrintResponse response = labelPrintService.createLabelPrint(request);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Label print record created successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to create label print: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllLabelPrints() {
        try {
            List<LabelPrintResponse> response = labelPrintService.getAllLabelPrints();
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Label prints fetched successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to fetch label prints: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getLabelPrintById(@PathVariable Long id) {
        try {
            LabelPrintResponse response = labelPrintService.getLabelPrintById(id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Label print fetched successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.builder()
                    .success(false)
                    .message("Label print not found: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse> getLabelPrintsByProductId(@PathVariable Long productId) {
        try {
            List<LabelPrintResponse> response = labelPrintService.getLabelPrintsByProductId(productId);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Label prints fetched successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to fetch label prints: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse> getLabelPrintsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<LabelPrintResponse> response = labelPrintService.getLabelPrintsByDateRange(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Label prints fetched successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to fetch label prints: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/product/{productId}/total")
    public ResponseEntity<ApiResponse> getTotalLabelsPrintedForProduct(@PathVariable Long productId) {
        try {
            Long total = labelPrintService.getTotalLabelsPrintedForProduct(productId);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Total labels fetched successfully")
                    .data(total)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to fetch total labels: " + e.getMessage())
                    .build());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteLabelPrint(@PathVariable Long id) {
        try {
            labelPrintService.deleteLabelPrint(id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Label print deleted successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to delete label print: " + e.getMessage())
                    .build());
        }
    }
}
