package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentResponse {
    private Long id;
    private String shipmentNumber;
    private String invoiceNumber;
    private String customer;
    private String carrier;
    private String trackingNumber;
    private LocalDate shipmentDate;
    private LocalDate expectedDelivery;
    private String shippingAddress;
    private BigDecimal shippingCost;
    private Integer itemCount;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
