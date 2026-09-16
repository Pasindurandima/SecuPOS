package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.ReceiptPrinterDTO;
import com.example.demo.dto.SettingsProfileDTO;
import com.example.demo.dto.TaxRateDTO;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.ReceiptPrinter;
import com.example.demo.model.SettingsProfile;
import com.example.demo.model.TaxRate;
import com.example.demo.repository.BusinessLocationRepository;
import com.example.demo.repository.ReceiptPrinterRepository;
import com.example.demo.repository.SettingsProfileRepository;
import com.example.demo.repository.TaxRateRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor
public class SettingsService {
    private final SettingsProfileRepository profileRepository;
    private final ReceiptPrinterRepository printerRepository;
    private final TaxRateRepository taxRateRepository;
    private final UserRepository userRepository;
    private final BusinessLocationRepository locationRepository;

    private User user(Long id) { return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found")); }
    private SettingsProfile profile(Long id) { return profileRepository.findByUserId(id).orElseGet(() -> { SettingsProfile p = new SettingsProfile(); p.setUser(user(id)); return profileRepository.save(p); }); }

    @Transactional public SettingsProfileDTO getProfile(Long userId) { return toDto(profile(userId)); }
    @Transactional public SettingsProfileDTO saveProfile(Long userId, SettingsProfileDTO dto) {
        SettingsProfile p = profile(userId);
        org.springframework.beans.BeanUtils.copyProperties(dto, p, nullFields(dto));
        return toDto(profileRepository.save(p));
    }
    private String[] nullFields(Object source) { return java.util.Arrays.stream(source.getClass().getDeclaredFields()).filter(f -> { try { f.setAccessible(true); return f.get(source) == null; } catch (IllegalAccessException e) { return false; } }).map(java.lang.reflect.Field::getName).toArray(String[]::new); }
    private SettingsProfileDTO toDto(SettingsProfile p) { SettingsProfileDTO d = new SettingsProfileDTO(); org.springframework.beans.BeanUtils.copyProperties(p, d); return d; }

    @Transactional(readOnly = true) public List<ReceiptPrinterDTO> printers(Long id) { return printerRepository.findByUserIdAndActiveTrueOrderByName(id).stream().map(this::toDto).collect(Collectors.toList()); }
    @Transactional public ReceiptPrinterDTO savePrinter(Long userId, ReceiptPrinterDTO dto) {
        ReceiptPrinter p = dto.getId() == null ? new ReceiptPrinter() : printerRepository.findById(dto.getId()).orElseThrow(() -> new ResourceNotFoundException("Printer not found"));
        if (p.getId() != null && !p.getUser().getId().equals(userId)) throw new ResourceNotFoundException("Printer not found");
        p.setUser(user(userId)); p.setName(dto.getName()); p.setPrinterType(dto.getPrinterType()); p.setConnectionType(dto.getConnectionType()); p.setConnectionValue(dto.getConnectionValue()); p.setPaperWidth(dto.getPaperWidth()); p.setActive(true);
        p.setLocation(dto.getLocationId() == null ? null : locationRepository.findById(dto.getLocationId()).orElseThrow(() -> new ResourceNotFoundException("Location not found")));
        return toDto(printerRepository.save(p));
    }
    @Transactional public void deletePrinter(Long userId, Long id) { ReceiptPrinter p = printerRepository.findById(id).filter(x -> x.getUser().getId().equals(userId)).orElseThrow(() -> new ResourceNotFoundException("Printer not found")); p.setActive(false); printerRepository.save(p); }
    private ReceiptPrinterDTO toDto(ReceiptPrinter p) { ReceiptPrinterDTO d = new ReceiptPrinterDTO(); d.setId(p.getId()); d.setName(p.getName()); d.setPrinterType(p.getPrinterType()); d.setConnectionType(p.getConnectionType()); d.setConnectionValue(p.getConnectionValue()); d.setPaperWidth(p.getPaperWidth()); d.setActive(p.getActive()); if (p.getLocation() != null) d.setLocationId(p.getLocation().getId()); return d; }

    @Transactional(readOnly = true) public List<TaxRateDTO> taxRates(Long id) { return taxRateRepository.findByUserIdAndActiveTrueOrderByName(id).stream().map(this::toDto).collect(Collectors.toList()); }
    @Transactional public TaxRateDTO saveTaxRate(Long userId, TaxRateDTO dto) {
        TaxRate t = dto.getId() == null ? new TaxRate() : taxRateRepository.findById(dto.getId()).orElseThrow(() -> new ResourceNotFoundException("Tax rate not found"));
        if (t.getId() != null && !t.getUser().getId().equals(userId)) throw new ResourceNotFoundException("Tax rate not found");
        t.setUser(user(userId)); t.setName(dto.getName()); t.setRate(dto.getRate()); t.setTaxType(dto.getTaxType()); t.setTaxNumber(dto.getTaxNumber()); t.setDefaultRate(Boolean.TRUE.equals(dto.getDefaultRate())); t.setActive(true);
        if (t.getDefaultRate()) taxRateRepository.findByUserIdAndActiveTrueOrderByName(userId).forEach(other -> { if (!other.getId().equals(t.getId())) other.setDefaultRate(false); });
        return toDto(taxRateRepository.save(t));
    }
    @Transactional public void deleteTaxRate(Long userId, Long id) { TaxRate t = taxRateRepository.findById(id).filter(x -> x.getUser().getId().equals(userId)).orElseThrow(() -> new ResourceNotFoundException("Tax rate not found")); t.setActive(false); taxRateRepository.save(t); }
    private TaxRateDTO toDto(TaxRate t) { TaxRateDTO d = new TaxRateDTO(); d.setId(t.getId()); d.setName(t.getName()); d.setRate(t.getRate()); d.setTaxType(t.getTaxType()); d.setTaxNumber(t.getTaxNumber()); d.setDefaultRate(t.getDefaultRate()); d.setActive(t.getActive()); return d; }
}