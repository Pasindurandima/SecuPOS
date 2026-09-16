package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.UnitRequest;
import com.example.demo.dto.UnitResponse;
import com.example.demo.service.UnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @PostMapping
    public ResponseEntity<ApiResponse> createUnit(@RequestBody UnitRequest request) {
        try {
            UnitResponse unit = unitService.createUnit(request);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Unit created successfully")
                    .data(unit)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllUnits() {
        try {
            List<UnitResponse> units = unitService.getAllUnits();
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Units retrieved successfully")
                    .data(units)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getUnitById(@PathVariable Long id) {
        try {
            UnitResponse unit = unitService.getUnitById(id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Unit retrieved successfully")
                    .data(unit)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateUnit(@PathVariable Long id, @RequestBody UnitRequest request) {
        try {
            UnitResponse unit = unitService.updateUnit(id, request);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Unit updated successfully")
                    .data(unit)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteUnit(@PathVariable Long id) {
        try {
            unitService.deleteUnit(id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Unit deleted successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchUnits(@RequestParam(required = false) String query) {
        try {
            List<UnitResponse> units = unitService.searchUnits(query);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Units retrieved successfully")
                    .data(units)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
