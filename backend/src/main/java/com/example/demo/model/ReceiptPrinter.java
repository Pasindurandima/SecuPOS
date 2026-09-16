package com.example.demo.model;

import com.example.demo.entity.BusinessLocation;
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
@Table(name = "receipt_printers")
@Data @NoArgsConstructor
public class ReceiptPrinter {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "user_id") private User user;
    @ManyToOne @JoinColumn(name = "location_id") private BusinessLocation location;
    @Column(nullable = false) private String name;
    private String printerType;
    private String connectionType;
    private String connectionValue;
    private String paperWidth;
    private Boolean active = true;
}