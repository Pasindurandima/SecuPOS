package com.example.demo.dto;
import java.math.BigDecimal;

import lombok.Data;
@Data
public class TaxRateDTO { private Long id; private String name, taxType, taxNumber; private BigDecimal rate; private Boolean defaultRate, active; }