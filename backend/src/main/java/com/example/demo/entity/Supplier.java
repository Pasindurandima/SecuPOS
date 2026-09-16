package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "suppliers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Supplier extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
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

    @Column(length = 1000)
    private String notes;

    @OneToMany(mappedBy = "supplier")
    private List<Purchase> purchases = new ArrayList<>();
}
