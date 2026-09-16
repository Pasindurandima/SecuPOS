package com.example.demo.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "stock_adjustments")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustment extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String referenceNumber;

    @Column(nullable = false)
    private LocalDateTime adjustmentDate;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdjustmentType adjustmentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdjustmentReason reason;

    @OneToMany(mappedBy = "stockAdjustment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StockAdjustmentItem> items = new ArrayList<>();

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalQuantity = 0;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 1000)
    private String notes;

    private String documentPath;

    public enum AdjustmentType {
        NORMAL, ABNORMAL
    }

    public enum AdjustmentReason {
        DAMAGED_GOODS("Damaged goods"),
        STOCK_FOUND("Stock found"),
        EXPIRED_PRODUCTS("Expired products"),
        THEFT_LOSS("Theft/Loss"),
        PHYSICAL_COUNT("Physical count adjustment"),
        OTHER("Other");

        private final String description;

        AdjustmentReason(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
