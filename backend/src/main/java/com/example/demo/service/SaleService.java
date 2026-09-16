package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.*;
import com.example.demo.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;

    @Transactional
    public SaleResponse createSale(SaleRequest request) {
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate customer if provided
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        }

        // Create sale
        Sale sale = Sale.builder()
                .invoiceNumber(generateInvoiceNumber())
                .customer(customer)
                .saleDate(request.getSaleDate())
                .items(new ArrayList<>())
                .subtotal(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .paidAmount(request.getPaidAmount())
                .changeAmount(BigDecimal.ZERO)
                .paymentMethod(Sale.PaymentMethod.valueOf(request.getPaymentMethod()))
                .status(Sale.SaleStatus.COMPLETED)
                .user(user)
                .notes(request.getNotes())
                .build();

        // Process sale items
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (SaleItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            // Check stock availability
            if (product.getQuantity() < itemRequest.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName() + 
                        ". Available: " + product.getQuantity() + ", Requested: " + itemRequest.getQuantity());
            }

            // Calculate amounts
            BigDecimal itemSubtotal = itemRequest.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            BigDecimal taxRate = product.getTaxRate() != null ? product.getTaxRate() : BigDecimal.ZERO;
            BigDecimal taxAmount = itemSubtotal.multiply(taxRate).divide(BigDecimal.valueOf(100));
            BigDecimal itemTotal = itemSubtotal.add(taxAmount);

            // Create sale item
            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemRequest.getUnitPrice())
                    .subtotal(itemSubtotal)
                    .taxRate(taxRate)
                    .taxAmount(taxAmount)
                    .total(itemTotal)
                    .build();

            sale.getItems().add(saleItem);

            subtotal = subtotal.add(itemSubtotal);
            totalTax = totalTax.add(taxAmount);

            // Update product quantity
            product.setQuantity(product.getQuantity() - itemRequest.getQuantity());
            productRepository.save(product);
        }

        // Calculate sale totals
        BigDecimal total = subtotal.add(totalTax);
        BigDecimal changeAmount = request.getPaidAmount().subtract(total);

        if (changeAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Paid amount is less than total amount");
        }

        sale.setSubtotal(subtotal);
        sale.setTax(totalTax);
        sale.setTotal(total);
        sale.setChangeAmount(changeAmount);

        Sale savedSale = saleRepository.save(sale);
        return dtoMapper.toSaleResponse(savedSale);
    }

    public SaleResponse getSale(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        return dtoMapper.toSaleResponse(sale);
    }

    public List<SaleResponse> getAllSales() {
        return saleRepository.findAllOrderByDateDesc().stream()
                .map(dtoMapper::toSaleResponse)
                .collect(Collectors.toList());
    }

    public List<SaleResponse> getSalesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return saleRepository.findSalesByDateRange(startDate, endDate).stream()
                .map(dtoMapper::toSaleResponse)
                .collect(Collectors.toList());
    }

    public List<SaleResponse> getSalesByCustomer(Long customerId) {
        return saleRepository.findByCustomerId(customerId).stream()
                .map(dtoMapper::toSaleResponse)
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalSalesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal total = saleRepository.getTotalSalesByDateRange(startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    public Long getSalesCountByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return saleRepository.getCountByDateRange(startDate, endDate);
    }

    @Transactional
    public void cancelSale(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));

        if (sale.getStatus() == Sale.SaleStatus.CANCELLED) {
            throw new BadRequestException("Sale is already cancelled");
        }

        // Restore product quantities
        for (SaleItem item : sale.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        sale.setStatus(Sale.SaleStatus.CANCELLED);
        saleRepository.save(sale);
    }

    private String generateInvoiceNumber() {
        String prefix = "INV";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return prefix + timestamp;
    }
}
