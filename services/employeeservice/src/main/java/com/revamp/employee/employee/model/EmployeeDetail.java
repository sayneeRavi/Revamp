package com.revamp.employee.employee.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "Details")
public class EmployeeDetail {

    @Id
    private String id;

    private String userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String[] skills;

    // Default constructor (required by Spring Data)
    public EmployeeDetail() {
    }

    // Constructor with all fields
    public EmployeeDetail(String userId, String fullName, String email, String phoneNumber, String[] skills) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.skills = skills;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String[] getSkills() {
        // Return empty array instead of null to avoid issues in frontend
        return skills != null ? skills : new String[0];
    }

    public void setSkills(String[] skills) {
        this.skills = skills;
    }
}

