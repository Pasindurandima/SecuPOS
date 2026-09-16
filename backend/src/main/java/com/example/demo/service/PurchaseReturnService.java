package com.example.demo.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.PurchaseReturnItemRequest;
import com.example.demo.dto.PurchaseReturnRequest;
import com.example.demo.dto.PurchaseReturnResponse;
import com.example.demo.entity.Product;
import com.example.demo.entity.PurchaseReturn;
import com.example.demo.entity.PurchaseReturnItem;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.PurchaseReturnRepository;
import com.example.demo.util.DtoMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PurchaseReturnService {

    private final PurchaseReturnRepository purchaseReturnRepository;
    private final ProductRepository productRepository;
    private final DtoMapper dtoMapper;

    @Transactional
    public PurchaseReturnResponse createPurchaseReturn(PurchaseReturnRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Purchase return must contain at least one item");
        }

        PurchaseReturn purchaseReturn = PurchaseReturn.builder()
                .returnNumber(generateReturnNumber())
                .purchaseInvoice(request.getPurchaseInvoice())
                .supplier(request.getSupplier())
                .returnDate(request.getReturnDate())
                .returnReason(request.getReturnReason())
                .refundType(request.getRefundType())
                .notes(request.getNotes())
                .total(request.getTotal())
                .items(new java.util.ArrayList<>())
                .build();

        for (PurchaseReturnItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            if (itemRequest.getReturnQty() > itemRequest.getPurchasedQty()) {
                throw new BadRequestException("Returned quantity cannot exceed purchased quantity for product: " + product.getName());
            }

            PurchaseReturnItem purchaseReturnItem = PurchaseReturnItem.builder()
                    .purchaseReturn(purchaseReturn)
                    .product(product)
                    .purchasedQty(itemRequest.getPurchasedQty())
                    .returnQty(itemRequest.getReturnQty())
                    .unitCost(itemRequest.getUnitCost())
                    .subtotal(itemRequest.getSubtotal())
                    .build();

            purchaseReturn.getItems().add(purchaseReturnItem);

            product.setQuantity(product.getQuantity() - itemRequest.getReturnQty());
            productRepository.save(product);
        }

        PurchaseReturn saved = purchaseReturnRepository.save(purchaseReturn);
        return dtoMapper.toPurchaseReturnResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PurchaseReturnResponse> getAllPurchaseReturns() {
        return purchaseReturnRepository.findAllByOrderByReturnDateDesc().stream()
                .map(dtoMapper::toPurchaseReturnResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseReturnResponse getPurchaseReturn(Long id) {
        PurchaseReturn purchaseReturn = purchaseReturnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase return not found with id: " + id));
        return dtoMapper.toPurchaseReturnResponse(purchaseReturn);
    }

    @Transactional
    public PurchaseReturnResponse updatePurchaseReturn(Long id, PurchaseReturnRequest request) {
        PurchaseReturn purchaseReturn = purchaseReturnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase return not found with id: " + id));

        purchaseReturn.setPurchaseInvoice(request.getPurchaseInvoice());
        purchaseReturn.setSupplier(request.getSupplier());
        purchaseReturn.setReturnDate(request.getReturnDate());
        purchaseReturn.setReturnReason(request.getReturnReason());
        purchaseReturn.setRefundType(request.getRefundType());
        purchaseReturn.setNotes(request.getNotes());
        purchaseReturn.setTotal(request.getTotal());

        purchaseReturn.getItems().clear();

        for (PurchaseReturnItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            PurchaseReturnItem item = PurchaseReturnItem.builder()
                    .purchaseReturn(purchaseReturn)
                    .product(product)
                    .purchasedQty(itemRequest.getPurchasedQty())
                    .returnQty(itemRequest.getReturnQty())
                    .unitCost(itemRequest.getUnitCost())
                    .subtotal(itemRequest.getSubtotal())
                    .build();

            purchaseReturn.getItems().add(item);
        }

        PurchaseReturn saved = purchaseReturnRepository.save(purchaseReturn);
        return dtoMapper.toPurchaseReturnResponse(saved);
    }

    @Transactional
    public void deletePurchaseReturn(Long id) {
        PurchaseReturn purchaseReturn = purchaseReturnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase return not found with id: " + id));

        for (PurchaseReturnItem item : purchaseReturn.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getReturnQty());
            productRepository.save(product);
        }

        purchaseReturnRepository.delete(purchaseReturn);
    }

    private String generateReturnNumber() {
        return "PRTN-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
}
