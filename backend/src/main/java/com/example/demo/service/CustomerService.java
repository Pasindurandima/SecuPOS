package com.example.demo.service;

import com.example.demo.dto.CustomerRequest;
import com.example.demo.dto.CustomerResponse;
import com.example.demo.entity.Customer;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final DtoMapper dtoMapper;

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        // Check if email already exists
        if (request.getEmail() != null && customerRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Customer with email " + request.getEmail() + " already exists");
        }

        // Check if phone already exists
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Customer with phone " + request.getPhone() + " already exists");
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .customerGroup(request.getCustomerGroup() != null ? 
                        Customer.CustomerGroup.valueOf(request.getCustomerGroup()) : 
                        Customer.CustomerGroup.REGULAR)
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        return dtoMapper.toCustomerResponse(savedCustomer);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        // Check if email is being changed and if new email already exists
        if (request.getEmail() != null && 
            !request.getEmail().equals(customer.getEmail()) && 
            customerRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Customer with email " + request.getEmail() + " already exists");
        }

        // Check if phone is being changed and if new phone already exists
        if (!request.getPhone().equals(customer.getPhone()) && 
            customerRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Customer with phone " + request.getPhone() + " already exists");
        }

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setZipCode(request.getZipCode());
        if (request.getCustomerGroup() != null) {
            customer.setCustomerGroup(Customer.CustomerGroup.valueOf(request.getCustomerGroup()));
        }

        Customer updatedCustomer = customerRepository.save(customer);
        return dtoMapper.toCustomerResponse(updatedCustomer);
    }

    public CustomerResponse getCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return dtoMapper.toCustomerResponse(customer);
    }

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(dtoMapper::toCustomerResponse)
                .collect(Collectors.toList());
    }

    public List<CustomerResponse> searchCustomers(String name) {
        return customerRepository.findByNameContainingIgnoreCase(name).stream()
                .map(dtoMapper::toCustomerResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        customer.setIsActive(false);
        customerRepository.save(customer);
    }
}
