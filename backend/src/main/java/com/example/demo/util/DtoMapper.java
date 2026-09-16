package com.example.demo.util;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.demo.dto.BrandResponse;
import com.example.demo.dto.CategoryResponse;
import com.example.demo.dto.CustomerResponse;
import com.example.demo.dto.ExpenseResponse;
import com.example.demo.dto.ProductResponse;
import com.example.demo.dto.PurchaseItemResponse;
import com.example.demo.dto.PurchaseResponse;
import com.example.demo.dto.PurchaseReturnItemResponse;
import com.example.demo.dto.PurchaseReturnResponse;
import com.example.demo.dto.SaleItemResponse;
import com.example.demo.dto.SaleResponse;
import com.example.demo.dto.SaleReturnItemResponse;
import com.example.demo.dto.SaleReturnResponse;
import com.example.demo.dto.ShipmentResponse;
import com.example.demo.dto.StockAdjustmentItemResponse;
import com.example.demo.dto.StockAdjustmentResponse;
import com.example.demo.dto.StockTransferItemResponse;
import com.example.demo.dto.StockTransferResponse;
import com.example.demo.dto.SupplierResponse;
import com.example.demo.entity.Brand;
import com.example.demo.entity.Category;
import com.example.demo.entity.Customer;
import com.example.demo.entity.Expense;
import com.example.demo.entity.Product;
import com.example.demo.entity.Purchase;
import com.example.demo.entity.PurchaseItem;
import com.example.demo.entity.PurchaseReturn;
import com.example.demo.entity.PurchaseReturnItem;
import com.example.demo.entity.Sale;
import com.example.demo.entity.SaleItem;
import com.example.demo.entity.SaleReturn;
import com.example.demo.entity.SaleReturnItem;
import com.example.demo.entity.Shipment;
import com.example.demo.entity.StockAdjustment;
import com.example.demo.entity.StockAdjustmentItem;
import com.example.demo.entity.StockTransfer;
import com.example.demo.entity.StockTransferItem;
import com.example.demo.entity.Supplier;

@Component
public class DtoMapper {

    // Product mappings
    public ProductResponse toProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .description(product.getDescription())
                .category(product.getCategory() != null ? toCategoryResponse(product.getCategory()) : null)
                .brand(product.getBrand() != null ? toBrandResponse(product.getBrand()) : null)
                .unit(product.getUnit())
                .costPrice(product.getCostPrice())
                .sellingPrice(product.getSellingPrice())
                .quantity(product.getQuantity())
                .alertQuantity(product.getAlertQuantity())
                .barcode(product.getBarcode())
                .imageUrl(product.getImageUrl())
                .taxRate(product.getTaxRate())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    // Category mappings
    public CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .build();
    }

    // Brand mappings
    public BrandResponse toBrandResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .isActive(brand.getIsActive())
                .createdAt(brand.getCreatedAt())
                .build();
    }

    // Customer mappings
    public CustomerResponse toCustomerResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .city(customer.getCity())
                .state(customer.getState())
                .zipCode(customer.getZipCode())
                .customerGroup(customer.getCustomerGroup() != null ? customer.getCustomerGroup().name() : null)
                .isActive(customer.getIsActive())
                .createdAt(customer.getCreatedAt())
                .build();
    }

    // Supplier mappings
    public SupplierResponse toSupplierResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .city(supplier.getCity())
                .state(supplier.getState())
                .zipCode(supplier.getZipCode())
                .contactPerson(supplier.getContactPerson())
                .alternatePhone(supplier.getAlternatePhone())
                .country(supplier.getCountry())
                .taxNumber(supplier.getTaxNumber())
                .bankName(supplier.getBankName())
                .accountNumber(supplier.getAccountNumber())
                .accountHolderName(supplier.getAccountHolderName())
                .paymentTerms(supplier.getPaymentTerms())
                .creditLimit(supplier.getCreditLimit())
                .website(supplier.getWebsite())
                .notes(supplier.getNotes())
                .isActive(supplier.getIsActive())
                .createdAt(supplier.getCreatedAt())
                .build();
    }

    // Sale mappings
    public SaleResponse toSaleResponse(Sale sale) {
        return SaleResponse.builder()
                .id(sale.getId())
                .invoiceNumber(sale.getInvoiceNumber())
                .customer(sale.getCustomer() != null ? toCustomerResponse(sale.getCustomer()) : null)
                .saleDate(sale.getSaleDate())
                .items(sale.getItems().stream()
                        .map(this::toSaleItemResponse)
                        .collect(Collectors.toList()))
                .subtotal(sale.getSubtotal())
                .tax(sale.getTax())
                .discount(sale.getDiscount())
                .total(sale.getTotal())
                .paidAmount(sale.getPaidAmount())
                .changeAmount(sale.getChangeAmount())
                .paymentMethod(sale.getPaymentMethod().name())
                .status(sale.getStatus().name())
                .notes(sale.getNotes())
                .createdAt(sale.getCreatedAt())
                .build();
    }

    public SaleItemResponse toSaleItemResponse(SaleItem item) {
        return SaleItemResponse.builder()
                .id(item.getId())
                .product(toProductResponse(item.getProduct()))
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .taxRate(item.getTaxRate())
                .taxAmount(item.getTaxAmount())
                .total(item.getTotal())
                .build();
    }

        public SaleReturnResponse toSaleReturnResponse(SaleReturn saleReturn) {
                return SaleReturnResponse.builder()
                                .id(saleReturn.getId())
                                .returnNumber(saleReturn.getReturnNumber())
                                .saleInvoice(saleReturn.getSaleInvoice())
                                .customer(saleReturn.getCustomer())
                                .returnDate(saleReturn.getReturnDate())
                                .returnReason(saleReturn.getReturnReason())
                                .refundType(saleReturn.getRefundType())
                                .notes(saleReturn.getNotes())
                                .total(saleReturn.getTotal())
                                .items(saleReturn.getItems().stream().map(this::toSaleReturnItemResponse).collect(Collectors.toList()))
                                .createdAt(saleReturn.getCreatedAt())
                                .updatedAt(saleReturn.getUpdatedAt())
                                .build();
        }

        public SaleReturnItemResponse toSaleReturnItemResponse(SaleReturnItem item) {
                return SaleReturnItemResponse.builder()
                                .id(item.getId())
                                .product(toProductResponse(item.getProduct()))
                                .soldQty(item.getSoldQty())
                                .returnQty(item.getReturnQty())
                                .unitPrice(item.getUnitPrice())
                                .subtotal(item.getSubtotal())
                                .build();
        }

    // Purchase mappings
    public PurchaseResponse toPurchaseResponse(Purchase purchase) {
        return PurchaseResponse.builder()
                .id(purchase.getId())
                .purchaseNumber(purchase.getPurchaseNumber())
                .supplier(purchase.getSupplier() != null ? toSupplierResponse(purchase.getSupplier()) : null)
                .supplierAddress(purchase.getSupplierAddress())
                .referenceNo(purchase.getReferenceNo())
                .purchaseDate(purchase.getPurchaseDate())
                .status(purchase.getStatus().name())
                .businessLocation(purchase.getBusinessLocation())
                .payTerm(purchase.getPayTerm())
                .attachedDocumentPath(purchase.getAttachedDocumentPath())
                .items(purchase.getItems().stream()
                        .map(this::toPurchaseItemResponse)
                        .collect(Collectors.toList()))
                .subtotal(purchase.getSubtotal())
                .discountAmount(purchase.getDiscountAmount())
                .discountType(purchase.getDiscountType() != null ? purchase.getDiscountType().name() : null)
                .tax(purchase.getTax())
                .taxPercent(purchase.getTaxPercent())
                .shippingCharges(purchase.getShippingCharges())
                .total(purchase.getTotal())
                .additionalNotes(purchase.getAdditionalNotes())
                .paidAmount(purchase.getPaidAmount())
                .paidOn(purchase.getPaidOn())
                .paymentMethod(purchase.getPaymentMethod() != null ? purchase.getPaymentMethod().name() : null)
                .paymentAccount(purchase.getPaymentAccount())
                .paymentNote(purchase.getPaymentNote())
                .paymentDue(purchase.getPaymentDue())
                .createdAt(purchase.getCreatedAt())
                .build();
    }

    public PurchaseItemResponse toPurchaseItemResponse(PurchaseItem item) {
        return PurchaseItemResponse.builder()
                .id(item.getId())
                .product(toProductResponse(item.getProduct()))
                .quantity(item.getQuantity())
                .unitCostBeforeDiscount(item.getUnitCostBeforeDiscount())
                .discountPercent(item.getDiscountPercent())
                .unitCostBeforeTax(item.getUnitCostBeforeTax())
                .lineTotal(item.getLineTotal())
                .profitMarginPercent(item.getProfitMarginPercent())
                .unitSellingPrice(item.getUnitSellingPrice())
                .unitCost(item.getUnitCost())
                .subtotal(item.getSubtotal())
                .taxRate(item.getTaxRate())
                .taxAmount(item.getTaxAmount())
                .total(item.getTotal())
                .build();
    }

    public PurchaseReturnResponse toPurchaseReturnResponse(PurchaseReturn purchaseReturn) {
        return PurchaseReturnResponse.builder()
                .id(purchaseReturn.getId())
                .returnNumber(purchaseReturn.getReturnNumber())
                .purchaseInvoice(purchaseReturn.getPurchaseInvoice())
                .supplier(purchaseReturn.getSupplier())
                .returnDate(purchaseReturn.getReturnDate())
                .returnReason(purchaseReturn.getReturnReason())
                .refundType(purchaseReturn.getRefundType())
                .notes(purchaseReturn.getNotes())
                .total(purchaseReturn.getTotal())
                .items(purchaseReturn.getItems().stream()
                        .map(this::toPurchaseReturnItemResponse)
                        .collect(Collectors.toList()))
                .createdAt(purchaseReturn.getCreatedAt())
                .updatedAt(purchaseReturn.getUpdatedAt())
                .build();
    }

    public PurchaseReturnItemResponse toPurchaseReturnItemResponse(PurchaseReturnItem item) {
        return PurchaseReturnItemResponse.builder()
                .id(item.getId())
                .product(toProductResponse(item.getProduct()))
                .purchasedQty(item.getPurchasedQty())
                .returnQty(item.getReturnQty())
                .unitCost(item.getUnitCost())
                .subtotal(item.getSubtotal())
                .build();
    }

    // Expense mappings
    public ExpenseResponse toExpenseResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .referenceNo(expense.getReferenceNo())
                .title(expense.getTitle())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .expenseDate(expense.getExpenseDate())
                .businessLocation(expense.getBusinessLocation())
                .category(expense.getCategory())
                .paymentMethod(expense.getPaymentMethod().name())
                .paymentAccount(expense.getPaymentAccount())
                .taxPercent(expense.getTaxPercent())
                .taxAmount(expense.getTaxAmount())
                .expenseContact(expense.getExpenseContact())
                .additionalNotes(expense.getAdditionalNotes())
                .documentUrl(expense.getDocumentUrl())
                .isActive(expense.getIsActive())
                .createdAt(expense.getCreatedAt())
                .build();
    }

    // Stock Adjustment mappings
    public StockAdjustmentResponse toStockAdjustmentResponse(StockAdjustment stockAdjustment) {
        return StockAdjustmentResponse.builder()
                .id(stockAdjustment.getId())
                .referenceNumber(stockAdjustment.getReferenceNumber())
                .adjustmentDate(stockAdjustment.getAdjustmentDate())
                .location(stockAdjustment.getLocation())
                .adjustmentType(stockAdjustment.getAdjustmentType().name())
                .reason(stockAdjustment.getReason().name())
                .items(stockAdjustment.getItems().stream()
                        .map(this::toStockAdjustmentItemResponse)
                        .collect(Collectors.toList()))
                .totalAmount(stockAdjustment.getTotalAmount())
                .totalQuantity(stockAdjustment.getTotalQuantity())
                .notes(stockAdjustment.getNotes())
                .documentPath(stockAdjustment.getDocumentPath())
                .userName(stockAdjustment.getUser() != null ? stockAdjustment.getUser().getUsername() : null)
                .userId(stockAdjustment.getUser() != null ? stockAdjustment.getUser().getId() : null)
                .createdAt(stockAdjustment.getCreatedAt())
                .updatedAt(stockAdjustment.getUpdatedAt())
                .build();
    }

    public StockAdjustmentItemResponse toStockAdjustmentItemResponse(StockAdjustmentItem item) {
        return StockAdjustmentItemResponse.builder()
                .id(item.getId())
                .product(toProductResponse(item.getProduct()))
                .adjustmentType(item.getAdjustmentType().name())
                .currentStock(item.getCurrentStock())
                .quantity(item.getQuantity())
                .unitCost(item.getUnitCost())
                .subtotal(item.getSubtotal())
                .build();
    }

    public StockTransferResponse toStockTransferResponse(StockTransfer transfer) {
        return StockTransferResponse.builder()
                .id(transfer.getId())
                .transferNumber(transfer.getTransferNumber())
                .transferDate(transfer.getTransferDate())
                .fromLocation(transfer.getFromLocation())
                .toLocation(transfer.getToLocation())
                .status(transfer.getStatus() != null ? transfer.getStatus().name() : null)
                .items(transfer.getItems().stream()
                        .map(this::toStockTransferItemResponse)
                        .collect(Collectors.toList()))
                .totalAmount(transfer.getTotalAmount())
                .totalQuantity(transfer.getTotalQuantity())
                .userName(transfer.getUser() != null ? transfer.getUser().getUsername() : null)
                .userId(transfer.getUser() != null ? transfer.getUser().getId() : null)
                .notes(transfer.getNotes())
                .createdAt(transfer.getCreatedAt())
                .updatedAt(transfer.getUpdatedAt())
                .build();
    }

    public StockTransferItemResponse toStockTransferItemResponse(StockTransferItem item) {
        return StockTransferItemResponse.builder()
                .id(item.getId())
                .product(toProductResponse(item.getProduct()))
                .currentStock(item.getCurrentStock())
                .quantity(item.getQuantity())
                .unitCost(item.getUnitCost())
                .subtotal(item.getSubtotal())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

        public ShipmentResponse toShipmentResponse(Shipment shipment) {
                return ShipmentResponse.builder()
                                .id(shipment.getId())
                                .shipmentNumber(shipment.getShipmentNumber())
                                .invoiceNumber(shipment.getInvoiceNumber())
                                .customer(shipment.getCustomer())
                                .carrier(shipment.getCarrier())
                                .trackingNumber(shipment.getTrackingNumber())
                                .shipmentDate(shipment.getShipmentDate())
                                .expectedDelivery(shipment.getExpectedDelivery())
                                .shippingAddress(shipment.getShippingAddress())
                                .shippingCost(shipment.getShippingCost())
                                .itemCount(shipment.getItemCount())
                                .status(shipment.getStatus().name())
                                .notes(shipment.getNotes())
                                .createdAt(shipment.getCreatedAt())
                                .updatedAt(shipment.getUpdatedAt())
                                .build();
        }
}
