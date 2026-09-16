package com.example.demo.model;

import java.math.BigDecimal;

import com.example.demo.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tax_rates")
@Data @NoArgsConstructor
public class TaxRate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "user_id") private User user;
    @Column(nullable = false) private String name;
    @Column(nullable = false, precision = 8, scale = 2) private BigDecimal rate;
    private String taxType;
    private String taxNumber;
    private Boolean defaultRate = false;
    private Boolean active = true;
}