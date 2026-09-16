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
import com.example.demo.dto.BusinessLocationRequest;
import com.example.demo.dto.BusinessLocationResponse;
import com.example.demo.service.BusinessLocationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/business-locations")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class BusinessLocationController {

    private final BusinessLocationService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BusinessLocationResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Business locations retrieved successfully", service.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BusinessLocationResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Business location retrieved successfully", service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BusinessLocationResponse>> create(@Valid @RequestBody BusinessLocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business location created successfully", service.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BusinessLocationResponse>> update(
            @PathVariable Long id, @Valid @RequestBody BusinessLocationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Business location updated successfully", service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Business location deleted successfully", null));
    }
}
