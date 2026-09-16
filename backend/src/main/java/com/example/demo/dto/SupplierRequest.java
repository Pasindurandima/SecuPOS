package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRequest {

    @NotBlank(message = "Supplier name is required")
    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-() ]*$", message = "Invalid phone number format")
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
    private Integer paymentTerms; // Payment terms in days
    private Double creditLimit;
    private String website;
    private String notes;
}
