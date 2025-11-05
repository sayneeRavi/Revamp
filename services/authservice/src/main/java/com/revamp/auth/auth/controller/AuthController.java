// src/main/java/com/revamp/auth/auth/controller/AuthController.java
package com.revamp.auth.auth.controller;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.revamp.auth.auth.model.User;
import com.revamp.auth.auth.repository.UserRepository;
import com.revamp.auth.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Gateway usually handles CORS, keep for testing
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepository userRepository;

    // ✅ Inner DTOs must be static + public
    public static class RegisterRequest {
        public String username;
        public String email;
        public String password;
        public String role;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class AuthResponse {
        public String token;
        public Object user;
        public AuthResponse(String token, Object user) {
            this.token = token;
            this.user = user;
        }
    }

   @PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
    try {
        User created = authService.register(req.username, req.email, req.password, req.role);
        created.setPasswordHash(null);

        return ResponseEntity
            .status(201) // Created
            .body(Collections.singletonMap("message", "User registered successfully"));
    } catch (RuntimeException ex) {
        return ResponseEntity.badRequest()
                .body(Collections.singletonMap("message", ex.getMessage()));
    }
}


    @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    try {
        User user = authService.getUserByEmail(req.email);
        String token = authService.login(req.email, req.password);

        user.setPasswordHash(null); // don't leak hash
        return ResponseEntity.ok(new AuthResponse(
                token,
                Collections.singletonMap("role", user.getRole())
        ));
    } catch (RuntimeException ex) {
        return ResponseEntity.status(401)
                .body(Collections.singletonMap("message", ex.getMessage()));
    }
}

    // Admin endpoint to register employees
    @PostMapping("/register-employee")
    public ResponseEntity<?> registerEmployee(@RequestBody RegisterRequest req) {
        try {
            // Force role to EMPLOYEE for this endpoint
            User created = authService.register(req.username, req.email, req.password, "EMPLOYEE");
            created.setPasswordHash(null); // Don't return password hash

            // Return user data so frontend can use the ID for employee details
            return ResponseEntity
                .status(201)
                .body(created);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }

    // Get all employees
    @GetMapping("/employees")
    public ResponseEntity<?> getAllEmployees() {
        try {
            List<User> employees = userRepository.findAll()
                .stream()
                .filter(user -> "EMPLOYEE".equals(user.getRole()))
                .peek(user -> user.setPasswordHash(null)) // Remove password hashes
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(employees);
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(Collections.singletonMap("message", "Error fetching employees: " + ex.getMessage()));
        }
    }

    // Delete employee (User only - employee details are handled by employeeservice)
    @DeleteMapping("/employees/{userId}")
    public ResponseEntity<?> deleteEmployee(@PathVariable String userId) {
        try {
            // Check if user exists
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            
            // Only allow deletion of employees
            if (!"EMPLOYEE".equals(user.getRole())) {
                return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", "Only employees can be deleted through this endpoint"));
            }
            
            // Delete user (employee details should be deleted separately via employeeservice)
            userRepository.deleteById(userId);
            
            return ResponseEntity.ok(Collections.singletonMap("message", "Employee deleted successfully"));
        } catch (Exception ex) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }

    // Update employee (User)
    @PutMapping("/employees/{userId}")
    public ResponseEntity<?> updateEmployee(@PathVariable String userId, @RequestBody RegisterRequest req) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            
            // Only allow updating employees
            if (!"EMPLOYEE".equals(user.getRole())) {
                return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", "Only employees can be updated through this endpoint"));
            }
            
            // Update user fields
            if (req.username != null && !req.username.isEmpty()) {
                user.setUsername(req.username);
            }
            if (req.email != null && !req.email.isEmpty()) {
                user.setEmail(req.email);
            }
            
            User updated = userRepository.save(user);
            updated.setPasswordHash(null);
            
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }

}
