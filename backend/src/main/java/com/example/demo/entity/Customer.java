package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends BaseEntity {

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

    @Enumerated(EnumType.STRING)
    private CustomerGroup customerGroup;

    @OneToMany(mappedBy = "customer")
    private List<Sale> sales = new ArrayList<>();

    public enum CustomerGroup {
        REGULAR, VIP, WHOLESALE, RETAIL
    }
}
