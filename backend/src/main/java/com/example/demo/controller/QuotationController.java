package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.QuotationRequest;
import com.example.demo.dto.QuotationResponse;
import com.example.demo.entity.Quotation;
import com.example.demo.service.QuotationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quotations")
@RequiredArgsConstructor
public class QuotationController {

    private final QuotationService quotationService;

    @PostMapping
    public ResponseEntity<ApiResponse> createQuotation(@RequestBody QuotationRequest request) {
        try {
            QuotationResponse quotation = quotationService.createQuotation(request);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Quotation created successfully")
                    .data(quotation)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to create quotation: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllQuotations() {
        try {
            List<QuotationResponse> quotations = quotationService.getAllQuotations();
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Quotations retrieved successfully")
                    .data(quotations)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to retrieve quotations: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getQuotationById(@PathVariable Long id) {
        try {
            QuotationResponse quotation = quotationService.getQuotationById(id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Quotation retrieved successfully")
                    .data(quotation)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to retrieve quotation: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateQuotation(@PathVariable Long id, @RequestBody QuotationRequest request) {
        try {
            QuotationResponse quotation = quotationService.updateQuotation(id, request);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Quotation updated successfully")
                    .data(quotation)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to update quotation: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteQuotation(@PathVariable Long id) {
        try {
            quotationService.deleteQuotation(id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Quotation deleted successfully")
                    .data(null)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to delete quotation: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @PostMapping("/{id}/convert-to-sale")
    public ResponseEntity<ApiResponse> convertToSale(@PathVariable Long id) {
        try {
            ApiResponse response = quotationService.convertToSale(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to convert quotation: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            QuotationResponse quotation = quotationService.updateStatus(id, Quotation.QuotationStatus.valueOf(status.toUpperCase()));
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Quotation status updated successfully")
                    .data(quotation)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to update quotation status: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchQuotations(@RequestParam String searchTerm) {
        try {
            List<QuotationResponse> quotations = quotationService.searchQuotations(searchTerm);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Quotations found")
                    .data(quotations)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to search quotations: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse> getQuotationsByCustomer(@PathVariable Long customerId) {
        try {
            List<QuotationResponse> quotations = quotationService.getQuotationsByCustomer(customerId);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Customer quotations retrieved successfully")
                    .data(quotations)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to retrieve customer quotations: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse> getQuotationsByStatus(@PathVariable String status) {
        try {
            List<QuotationResponse> quotations = quotationService.getQuotationsByStatus(status);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Quotations retrieved successfully")
                    .data(quotations)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to retrieve quotations: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
}
