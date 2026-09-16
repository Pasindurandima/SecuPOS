package com.example.demo.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.dto.*;
import com.example.demo.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/shipments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ShipmentController {
    private final ShipmentService shipmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<ShipmentResponse>> create(@Valid @RequestBody ShipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Shipment created successfully", shipmentService.create(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShipmentResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Shipments retrieved successfully", shipmentService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Shipment retrieved successfully", shipmentService.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShipmentResponse>> update(@PathVariable Long id, @Valid @RequestBody ShipmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Shipment updated successfully", shipmentService.update(id, request)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ShipmentResponse>> updateStatus(@PathVariable Long id, @Valid @RequestBody ShipmentStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Shipment status updated successfully", shipmentService.updateStatus(id, request.getStatus())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        shipmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Shipment deleted successfully", null));
    }
}
