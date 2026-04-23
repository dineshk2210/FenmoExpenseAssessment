package com.expensetracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank @Email private String email;
    @NotBlank @Size(min = 6, message = "password must be at least 6 characters") private String password;
    @NotBlank private String name;

    public String getEmail() { return email; }
    public void setEmail(String e) { this.email = e; }
    public String getPassword() { return password; }
    public void setPassword(String p) { this.password = p; }
    public String getName() { return name; }
    public void setName(String n) { this.name = n; }
}
