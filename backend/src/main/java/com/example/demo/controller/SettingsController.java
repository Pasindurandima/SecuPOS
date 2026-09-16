package com.example.demo.controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.ReceiptPrinterDTO;
import com.example.demo.dto.SettingsProfileDTO;
import com.example.demo.dto.TaxRateDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.SettingsService;

import lombok.RequiredArgsConstructor;

@RestController @RequestMapping("/settings") @RequiredArgsConstructor
public class SettingsController {
    private final SettingsService service;
    private final UserRepository userRepository;
    private Long id(Authentication a) {
        if (a == null || a.getName() == null) {
            throw new ResourceNotFoundException("Authenticated user not found");
        }
        return userRepository.findByUsername(a.getName())
                .map(user -> user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
    @GetMapping("/profile") public ResponseEntity<ApiResponse<SettingsProfileDTO>> profile(Authentication a) { return ResponseEntity.ok(ApiResponse.success("Settings retrieved", service.getProfile(id(a)))); }
    @PutMapping("/profile") public ResponseEntity<ApiResponse<SettingsProfileDTO>> profile(Authentication a, @RequestBody SettingsProfileDTO d) { return ResponseEntity.ok(ApiResponse.success("Settings saved", service.saveProfile(id(a), d))); }
    @GetMapping("/printers") public ResponseEntity<ApiResponse<List<ReceiptPrinterDTO>>> printers(Authentication a) { return ResponseEntity.ok(ApiResponse.success("Printers retrieved", service.printers(id(a)))); }
    @PostMapping("/printers") public ResponseEntity<ApiResponse<ReceiptPrinterDTO>> printer(Authentication a, @RequestBody ReceiptPrinterDTO d) { return ResponseEntity.ok(ApiResponse.success("Printer saved", service.savePrinter(id(a), d))); }
    @DeleteMapping("/printers/{printerId}") public ResponseEntity<ApiResponse<Void>> printer(Authentication a, @PathVariable Long printerId) { service.deletePrinter(id(a), printerId); return ResponseEntity.ok(ApiResponse.success("Printer deleted", null)); }
    @GetMapping("/tax-rates") public ResponseEntity<ApiResponse<List<TaxRateDTO>>> taxRates(Authentication a) { return ResponseEntity.ok(ApiResponse.success("Tax rates retrieved", service.taxRates(id(a)))); }
    @PostMapping("/tax-rates") public ResponseEntity<ApiResponse<TaxRateDTO>> taxRate(Authentication a, @RequestBody TaxRateDTO d) { return ResponseEntity.ok(ApiResponse.success("Tax rate saved", service.saveTaxRate(id(a), d))); }
    @DeleteMapping("/tax-rates/{taxRateId}") public ResponseEntity<ApiResponse<Void>> taxRate(Authentication a, @PathVariable Long taxRateId) { service.deleteTaxRate(id(a), taxRateId); return ResponseEntity.ok(ApiResponse.success("Tax rate deleted", null)); }
}