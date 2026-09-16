package com.example.demo.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierResponse {
    
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String contactPerson;
    private String alternatePhone;
    private String country;
    private String taxNumber;
    private String bankName;
    private String accountNumber;
    private String accountHolderName;
    private Integer paymentTerms;
    private Double creditLimit;
    private String website;
    private String notes;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
