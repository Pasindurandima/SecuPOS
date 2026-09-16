package com.example.demo.controller;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.ProfitLossReportDTO;
import com.example.demo.service.ReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000"
})
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/profit-loss")
    public ResponseEntity<ApiResponse<ProfitLossReportDTO>> getProfitLossReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        // Default to last 6 months if not specified
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(6);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        ProfitLossReportDTO report = reportService.getProfitLossReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Profit & Loss report generated successfully", report));
    }
}
