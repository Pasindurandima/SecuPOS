package com.example.demo.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {

    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String prefix;
    private String phone;
    private String address;
    private Boolean isActive;
    private Boolean enableServiceStaffPin;
    private Boolean allowLogin;
    private Boolean accessAllLocations;
    private String roleName;
}