package com.example.demo.service;

import com.example.demo.dto.LabelPrintRequest;
import com.example.demo.dto.LabelPrintResponse;
import com.example.demo.entity.LabelPrint;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.repository.LabelPrintRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LabelPrintService {

    private final LabelPrintRepository labelPrintRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public LabelPrintResponse createLabelPrint(LabelPrintRequest request) {
        log.info("Creating label print for product ID: {}", request.getProductId());

        // Validate product exists
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));

        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Create label print record
        LabelPrint labelPrint = LabelPrint.builder()
                .product(product)
                .numberOfLabels(request.getNumberOfLabels())
                .labelType(request.getLabelType())
                .paperSize(request.getPaperSize())
                .includeProductName(request.getIncludeProductName())
                .includePrice(request.getIncludePrice())
                .includeBarcode(request.getIncludeBarcode())
                .includeCompanyName(request.getIncludeCompanyName())
                .companyName(request.getCompanyName())
                .printedAt(LocalDateTime.now())
                .printedBy(currentUser)
                .build();

        labelPrint = labelPrintRepository.save(labelPrint);
        log.info("Label print created successfully with ID: {}", labelPrint.getId());

        return convertToResponse(labelPrint);
    }

    public List<LabelPrintResponse> getAllLabelPrints() {
        log.info("Fetching all label prints");
        return labelPrintRepository.findAllOrderByPrintedAtDesc().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public LabelPrintResponse getLabelPrintById(Long id) {
        log.info("Fetching label print with ID: {}", id);
        LabelPrint labelPrint = labelPrintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Label print not found with id: " + id));
        return convertToResponse(labelPrint);
    }

    public List<LabelPrintResponse> getLabelPrintsByProductId(Long productId) {
        log.info("Fetching label prints for product ID: {}", productId);
        return labelPrintRepository.findByProductId(productId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<LabelPrintResponse> getLabelPrintsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching label prints between {} and {}", startDate, endDate);
        return labelPrintRepository.findByPrintedAtBetween(startDate, endDate).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public Long getTotalLabelsPrintedForProduct(Long productId) {
        log.info("Getting total labels printed for product ID: {}", productId);
        Long total = labelPrintRepository.getTotalLabelsPrintedForProduct(productId);
        return total != null ? total : 0L;
    }

    @Transactional
    public void deleteLabelPrint(Long id) {
        log.info("Deleting label print with ID: {}", id);
        if (!labelPrintRepository.existsById(id)) {
            throw new RuntimeException("Label print not found with id: " + id);
        }
        labelPrintRepository.deleteById(id);
        log.info("Label print deleted successfully");
    }

    private LabelPrintResponse convertToResponse(LabelPrint labelPrint) {
        Product product = labelPrint.getProduct();
        return LabelPrintResponse.builder()
                .id(labelPrint.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSku(product.getSku())
                .productBarcode(product.getBarcode())
                .productPrice(product.getSellingPrice().doubleValue())
                .productImageUrl(product.getImageUrl())
                .numberOfLabels(labelPrint.getNumberOfLabels())
                .labelType(labelPrint.getLabelType())
                .paperSize(labelPrint.getPaperSize())
                .includeProductName(labelPrint.getIncludeProductName())
                .includePrice(labelPrint.getIncludePrice())
                .includeBarcode(labelPrint.getIncludeBarcode())
                .includeCompanyName(labelPrint.getIncludeCompanyName())
                .companyName(labelPrint.getCompanyName())
                .printedAt(labelPrint.getPrintedAt())
                .printedByUsername(labelPrint.getPrintedBy().getUsername())
                .createdAt(labelPrint.getCreatedAt())
                .build();
    }
}
