package com.example.demo.controller;

import java.time.LocalDate;
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
import com.example.demo.dto.PaymentAccountRequest;
import com.example.demo.dto.PaymentAccountResponse;
import com.example.demo.dto.PaymentReportResponse;
import com.example.demo.service.PaymentAccountService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/payment-accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PaymentAccountController {
    private final PaymentAccountService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentAccountResponse>>> getAccounts() {
        return ResponseEntity.ok(ApiResponse.success("Payment accounts retrieved successfully", service.getAccounts()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentAccountResponse>> create(@Valid @RequestBody PaymentAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Payment account created successfully", service.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentAccountResponse>> update(@PathVariable Long id, @Valid @RequestBody PaymentAccountRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Payment account updated successfully", service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Payment account deleted successfully", null));
    }

    @GetMapping("/report")
    public ResponseEntity<ApiResponse<PaymentReportResponse>> report(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String location) {
        LocalDateTime from = fromDate == null ? null : fromDate.atStartOfDay();
        LocalDateTime to = toDate == null ? null : toDate.plusDays(1).atStartOfDay().minusNanos(1);
        return ResponseEntity.ok(ApiResponse.success("Payment report generated successfully", service.report(from, to, location)));
    }
}
