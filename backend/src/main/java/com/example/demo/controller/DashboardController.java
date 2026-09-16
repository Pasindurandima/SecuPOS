package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.DashboardOverview;
import com.example.demo.dto.DashboardStats;
import com.example.demo.dto.EssentialsOverview;
import com.example.demo.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboardStats() {
        DashboardStats stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved successfully", stats));
    }

    @GetMapping("/essentials")
    public ResponseEntity<ApiResponse<EssentialsOverview>> getEssentialsOverview() {
        return ResponseEntity.ok(ApiResponse.success("Essentials overview retrieved successfully", dashboardService.getEssentialsOverview()));
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<DashboardOverview>> getDashboardOverview() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard overview retrieved successfully", dashboardService.getDashboardOverview()));
    }
}
