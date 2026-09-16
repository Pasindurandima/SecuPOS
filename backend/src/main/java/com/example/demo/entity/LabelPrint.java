package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "label_prints")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabelPrint extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer numberOfLabels;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private LabelType labelType;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaperSize paperSize;

    @Column(nullable = false)
    private Boolean includeProductName;

    @Column(nullable = false)
    private Boolean includePrice;

    @Column(nullable = false)
    private Boolean includeBarcode;

    @Column(nullable = false)
    private Boolean includeCompanyName;

    @Column
    private String companyName;

    @Column
    private LocalDateTime printedAt;

    @ManyToOne
    @JoinColumn(name = "printed_by")
    private User printedBy;

    public enum LabelType {
        BARCODE,
        QR_CODE,
        PRODUCT_INFO,
        PRICE_TAG
    }

    public enum PaperSize {
        A4_30_PER_SHEET,
        A4_20_PER_SHEET,
        A4_12_PER_SHEET,
        CONTINUOUS_ROLL,
        CUSTOM
    }
}
