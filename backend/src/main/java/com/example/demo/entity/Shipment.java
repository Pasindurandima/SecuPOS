package com.example.demo.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shipments")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shipment extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String shipmentNumber;
    @Column(nullable = false)
    private String invoiceNumber;
    private String customer;
    @Column(nullable = false)
    private String carrier;
    private String trackingNumber;
    @Column(nullable = false)
    private LocalDate shipmentDate;
    private LocalDate expectedDelivery;
    @Column(nullable = false, length = 1000)
    private String shippingAddress;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal shippingCost;
    @Column(nullable = false)
    private Integer itemCount;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status;
    @Column(length = 1000)
    private String notes;

    public enum ShipmentStatus { PENDING, PROCESSING, IN_TRANSIT, DELIVERED, CANCELLED }
}
