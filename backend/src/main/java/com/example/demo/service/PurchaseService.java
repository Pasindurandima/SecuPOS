package com.example.demo.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.PurchaseItemRequest;
import com.example.demo.dto.PurchasePaymentRequest;
import com.example.demo.dto.PurchaseRequest;
import com.example.demo.dto.PurchaseResponse;
import com.example.demo.entity.Product;
import com.example.demo.entity.Purchase;
import com.example.demo.entity.PurchaseItem;
import com.example.demo.entity.Supplier;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.PurchaseRepository;
import com.example.demo.repository.SupplierRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.DtoMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;

    @Transactional
    public PurchaseResponse createPurchase(PurchaseRequest request) {
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate supplier
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));

        // Parse enums
        Purchase.PurchaseStatus status = Purchase.PurchaseStatus.valueOf(request.getPurchaseStatus().toUpperCase());
        Purchase.DiscountType discountType = request.getDiscountType() != null 
            ? Purchase.DiscountType.valueOf(request.getDiscountType().toUpperCase()) 
            : null;
        Purchase.PaymentMethod paymentMethod = request.getPaymentMethod() != null 
            ? Purchase.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()) 
            : null;

        // Create purchase
        Purchase purchase = Purchase.builder()
                .purchaseNumber(generatePurchaseNumber())
                .supplier(supplier)
                .supplierAddress(request.getSupplierAddress())
                .referenceNo(request.getReferenceNo())
                .purchaseDate(request.getPurchaseDate())
                .status(status)
                .businessLocation(request.getBusinessLocation())
                .payTerm(request.getPayTerm())
                .attachedDocumentPath(request.getAttachedDocumentPath())
                .items(new ArrayList<>())
                .subtotal(request.getSubtotal())
                .discountAmount(request.getDiscountAmount())
                .discountType(discountType)
                .tax(request.getTax())
                .taxPercent(request.getTaxPercent())
                .shippingCharges(request.getShippingCharges())
                .total(request.getTotal())
                .additionalNotes(request.getAdditionalNotes())
                .paidAmount(request.getPaidAmount())
                .paidOn(request.getPaidOn())
                .paymentMethod(paymentMethod)
                .paymentAccount(request.getPaymentAccount())
                .paymentNote(request.getPaymentNote())
                .paymentDue(request.getPaymentDue())
                .user(user)
                .build();

        // Process purchase items
        for (PurchaseItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            // Create purchase item
            PurchaseItem purchaseItem = PurchaseItem.builder()
                    .purchase(purchase)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitCostBeforeDiscount(itemRequest.getUnitCostBeforeDiscount())
                    .discountPercent(itemRequest.getDiscountPercent())
                    .unitCostBeforeTax(itemRequest.getUnitCostBeforeTax())
                    .lineTotal(itemRequest.getLineTotal())
                    .profitMarginPercent(itemRequest.getProfitMarginPercent())
                    .unitSellingPrice(itemRequest.getUnitSellingPrice())
                    .unitCost(itemRequest.getUnitCost())
                    .subtotal(itemRequest.getLineTotal())
                    .taxRate(BigDecimal.ZERO)
                    .taxAmount(BigDecimal.ZERO)
                    .total(itemRequest.getLineTotal())
                    .build();

            purchase.getItems().add(purchaseItem);

            // Update product quantity and cost price
            product.setQuantity(product.getQuantity() + itemRequest.getQuantity());
            product.setCostPrice(itemRequest.getUnitCostBeforeTax());
            // Update selling price if provided
            if (itemRequest.getUnitSellingPrice() != null && itemRequest.getUnitSellingPrice().compareTo(BigDecimal.ZERO) > 0) {
                product.setSellingPrice(itemRequest.getUnitSellingPrice());
            }
            productRepository.save(product);
        }

        Purchase savedPurchase = purchaseRepository.save(purchase);
        return dtoMapper.toPurchaseResponse(savedPurchase);
    }

    public PurchaseResponse getPurchase(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
        return dtoMapper.toPurchaseResponse(purchase);
    }

    public List<PurchaseResponse> getAllPurchases() {
        return purchaseRepository.findAllOrderByDateDesc().stream()
                .map(dtoMapper::toPurchaseResponse)
                .collect(Collectors.toList());
    }

    public List<PurchaseResponse> getPurchasesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return purchaseRepository.findPurchasesByDateRange(startDate, endDate).stream()
                .map(dtoMapper::toPurchaseResponse)
                .collect(Collectors.toList());
    }

    public List<PurchaseResponse> getPurchasesBySupplier(Long supplierId) {
        return purchaseRepository.findBySupplierId(supplierId).stream()
                .map(dtoMapper::toPurchaseResponse)
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalPurchasesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal total = purchaseRepository.getTotalPurchasesByDateRange(startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Transactional
    public PurchaseResponse recordPayment(Long id, PurchasePaymentRequest request) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        BigDecimal total = purchase.getTotal() != null ? purchase.getTotal() : BigDecimal.ZERO;
        BigDecimal paidAmount = purchase.getPaidAmount() != null ? purchase.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal paymentDue = total.subtract(paidAmount);

        if (request.getAmount().compareTo(paymentDue) > 0) {
            throw new BadRequestException("Payment amount cannot exceed the outstanding balance of " + paymentDue);
        }

        Purchase.PaymentMethod paymentMethod;
        try {
            paymentMethod = Purchase.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unsupported payment method: " + request.getPaymentMethod());
        }

        BigDecimal updatedPaidAmount = paidAmount.add(request.getAmount());
        purchase.setPaidAmount(updatedPaidAmount);
        purchase.setPaymentDue(total.subtract(updatedPaidAmount));
        purchase.setPaidOn(request.getPaidOn() != null ? request.getPaidOn() : LocalDateTime.now());
        purchase.setPaymentMethod(paymentMethod);
        purchase.setPaymentAccount(request.getPaymentAccount());
        purchase.setPaymentNote(request.getPaymentNote());

        return dtoMapper.toPurchaseResponse(purchaseRepository.save(purchase));
    }

    @Transactional
    public void cancelPurchase(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        if (purchase.getStatus() == Purchase.PurchaseStatus.CANCELLED) {
            throw new BadRequestException("Purchase is already cancelled");
        }

        // Restore product quantities
        for (PurchaseItem item : purchase.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        purchase.setStatus(Purchase.PurchaseStatus.CANCELLED);
        purchaseRepository.save(purchase);
    }

    @Transactional
    public void deletePurchase(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        for (PurchaseItem item : purchase.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setQuantity(Math.max(0, product.getQuantity() - item.getQuantity()));
                productRepository.save(product);
            }
        }

        purchaseRepository.delete(purchase);
    }

    private String generatePurchaseNumber() {
        String prefix = "PUR";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return prefix + timestamp;
    }
}
