package com.example.demo.dto;
import lombok.Data;
@Data
public class ReceiptPrinterDTO { private Long id, locationId; private String name, printerType, connectionType, connectionValue, paperWidth; private Boolean active; }