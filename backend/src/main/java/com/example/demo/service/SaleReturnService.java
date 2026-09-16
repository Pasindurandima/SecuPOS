package com.example.demo.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.SaleReturnRepository;
import com.example.demo.util.DtoMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SaleReturnService {
    private final SaleReturnRepository saleReturnRepository;
    private final ProductRepository productRepository;
    private final DtoMapper dtoMapper;

    @Transactional
    public SaleReturnResponse create(SaleReturnRequest request) {
        SaleReturn saleReturn = SaleReturn.builder()
                .returnNumber(generateReturnNumber())
                .saleInvoice(request.getSaleInvoice())
                .customer(request.getCustomer())
                .returnDate(request.getReturnDate())
                .returnReason(request.getReturnReason())
                .refundType(request.getRefundType())
                .notes(request.getNotes())
                .total(request.getTotal())
                .items(new ArrayList<>())
                .build();

        for (SaleReturnItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));
            if (itemRequest.getReturnQty() > itemRequest.getSoldQty()) {
                throw new BadRequestException("Return quantity cannot exceed sold quantity for " + product.getName());
            }
            saleReturn.getItems().add(SaleReturnItem.builder()
                    .saleReturn(saleReturn).product(product)
                    .soldQty(itemRequest.getSoldQty()).returnQty(itemRequest.getReturnQty())
                    .unitPrice(itemRequest.getUnitPrice()).subtotal(itemRequest.getSubtotal()).build());
            product.setQuantity(product.getQuantity() + itemRequest.getReturnQty());
            productRepository.save(product);
        }
        return dtoMapper.toSaleReturnResponse(saleReturnRepository.save(saleReturn));
    }

    @Transactional(readOnly = true)
    public List<SaleReturnResponse> getAll() {
        return saleReturnRepository.findAllByOrderByReturnDateDesc().stream()
                .map(dtoMapper::toSaleReturnResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SaleReturnResponse getById(Long id) {
        return dtoMapper.toSaleReturnResponse(saleReturnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale return not found with id: " + id)));
    }

    @Transactional
    public void delete(Long id) {
        SaleReturn saleReturn = saleReturnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale return not found with id: " + id));
        for (SaleReturnItem item : saleReturn.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(Math.max(0, product.getQuantity() - item.getReturnQty()));
            productRepository.save(product);
        }
        saleReturnRepository.delete(saleReturn);
    }

    private String generateReturnNumber() {
        return "SRET-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
}
