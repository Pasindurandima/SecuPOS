package com.example.demo.dto;

import com.example.demo.entity.LabelPrint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabelPrintRequest {
    private Long productId;
    private Integer numberOfLabels;
    private LabelPrint.LabelType labelType;
    private LabelPrint.PaperSize paperSize;
    private Boolean includeProductName;
    private Boolean includePrice;
    private Boolean includeBarcode;
    private Boolean includeCompanyName;
    private String companyName;
}
