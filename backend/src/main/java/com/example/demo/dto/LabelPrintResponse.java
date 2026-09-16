package com.example.demo.dto;

import com.example.demo.entity.LabelPrint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabelPrintResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private String productBarcode;
    private Double productPrice;
    private String productImageUrl;
    private Integer numberOfLabels;
    private LabelPrint.LabelType labelType;
    private LabelPrint.PaperSize paperSize;
    private Boolean includeProductName;
    private Boolean includePrice;
    private Boolean includeBarcode;
    private Boolean includeCompanyName;
    private String companyName;
    private LocalDateTime printedAt;
    private String printedByUsername;
    private LocalDateTime createdAt;
}
