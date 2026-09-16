package com.example.demo.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.ShipmentRequest;
import com.example.demo.dto.ShipmentResponse;
import com.example.demo.entity.Sale;
import com.example.demo.entity.Shipment;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.SaleRepository;
import com.example.demo.repository.ShipmentRepository;
import com.example.demo.util.DtoMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShipmentService {
    private final ShipmentRepository shipmentRepository;
    private final SaleRepository saleRepository;
    private final DtoMapper dtoMapper;

    @Transactional
    public ShipmentResponse create(ShipmentRequest request) {
        Sale sale = findSale(request.getInvoiceNumber());
        Shipment shipment = Shipment.builder()
                .shipmentNumber(generateShipmentNumber())
                .invoiceNumber(sale.getInvoiceNumber())
                .customer(sale.getCustomer() != null ? sale.getCustomer().getName() : "Walk-in Customer")
                .carrier(request.getCarrier())
                .trackingNumber(request.getTrackingNumber())
                .shipmentDate(request.getShipmentDate())
                .expectedDelivery(request.getExpectedDelivery())
                .shippingAddress(request.getShippingAddress())
                .shippingCost(request.getShippingCost())
                .itemCount(sale.getItems() != null ? sale.getItems().stream().mapToInt(item -> item.getQuantity()).sum() : request.getItemCount())
                .status(Shipment.ShipmentStatus.PENDING)
                .notes(request.getNotes())
                .build();
        return dtoMapper.toShipmentResponse(shipmentRepository.save(shipment));
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponse> getAll() {
        return shipmentRepository.findAllByOrderByShipmentDateDesc().stream()
                .map(dtoMapper::toShipmentResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getById(Long id) {
        return dtoMapper.toShipmentResponse(findShipment(id));
    }

    @Transactional
    public ShipmentResponse update(Long id, ShipmentRequest request) {
        Shipment shipment = findShipment(id);
        Sale sale = findSale(request.getInvoiceNumber());
        shipment.setInvoiceNumber(sale.getInvoiceNumber());
        shipment.setCustomer(sale.getCustomer() != null ? sale.getCustomer().getName() : "Walk-in Customer");
        shipment.setCarrier(request.getCarrier());
        shipment.setTrackingNumber(request.getTrackingNumber());
        shipment.setShipmentDate(request.getShipmentDate());
        shipment.setExpectedDelivery(request.getExpectedDelivery());
        shipment.setShippingAddress(request.getShippingAddress());
        shipment.setShippingCost(request.getShippingCost());
        shipment.setItemCount(request.getItemCount());
        shipment.setNotes(request.getNotes());
        return dtoMapper.toShipmentResponse(shipmentRepository.save(shipment));
    }

    @Transactional
    public ShipmentResponse updateStatus(Long id, String status) {
        Shipment shipment = findShipment(id);
        try {
            shipment.setStatus(Shipment.ShipmentStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unsupported shipment status: " + status);
        }
        return dtoMapper.toShipmentResponse(shipmentRepository.save(shipment));
    }

    @Transactional
    public void delete(Long id) {
        shipmentRepository.delete(findShipment(id));
    }

    private Sale findSale(String invoiceNumber) {
        return saleRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with invoice: " + invoiceNumber));
    }

    private Shipment findShipment(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with id: " + id));
    }

    private String generateShipmentNumber() {
        return "SHIP-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
}
