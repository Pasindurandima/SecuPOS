package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "business_locations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class BusinessLocation extends BaseEntity {

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(unique = true, length = 40)
    private String code;

    @Column(length = 500)
    private String address;

    @Column(length = 40)
    private String phone;

    @Column(length = 160)
    private String email;
}
