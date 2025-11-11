package com.revamp.auth.auth.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;
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

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.revamp.auth.auth.model.User;
import com.revamp.auth.auth.repository.UserRepository;
import com.revamp.auth.auth.service.AuthService;
import com.revamp.auth.auth.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Keep for testing; Gateway will handle in production
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // ===== DTO Classes =====
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

    public static class ChangePasswordRequest {
        public String email;
        public String currentPassword;
        public String newPassword;
    }

    // ===== Endpoints =====

    /** Register new user (default role = CONSUMER) */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            User created = authService.register(req.username, req.email, req.password, req.role);
            created.setPasswordHash(null);
            return ResponseEntity.status(201)
                    .body(Collections.singletonMap("message", "User registered successfully"));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }

    /** Login with email/password */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            User user = authService.getUserByEmail(req.email);
            String token = authService.login(req.email, req.password);

            user.setPasswordHash(null);
            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(401)
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }

    /** Change password */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req) {
        try {
            authService.changePassword(req.email, req.currentPassword, req.newPassword);
            return ResponseEntity.ok(Collections.singletonMap("message", "Password changed successfully"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400)
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }

    /** Admin-only: Register employee user */
    @PostMapping("/register-employee")
    public ResponseEntity<?> registerEmployee(@RequestBody RegisterRequest req) {
        try {
            User created = authService.register(req.username, req.email, req.password, "EMPLOYEE");
            created.setPasswordHash(null);
            return ResponseEntity.status(201).body(created);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }

    /** Admin-only: Get all employees */
    @GetMapping("/employees")
    public ResponseEntity<?> getAllEmployees() {
        try {
            List<User> employees = userRepository.findAll().stream()
                    .filter(user -> "EMPLOYEE".equals(user.getRole()))
                    .peek(user -> user.setPasswordHash(null))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(employees);
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(Collections.singletonMap("message", "Error fetching employees: " + ex.getMessage()));
        }
    }

    /** Admin-only: Delete employee */
    @DeleteMapping("/employees/{userId}")
    public ResponseEntity<?> deleteEmployee(@PathVariable String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            if (!"EMPLOYEE".equals(user.getRole())) {
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("message", "Only employees can be deleted"));
            }

            userRepository.deleteById(userId);
            return ResponseEntity.ok(Collections.singletonMap("message", "Employee deleted successfully"));
        } catch (Exception ex) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }

    /** Admin-only: Update employee info */
    @PutMapping("/employees/{userId}")
    public ResponseEntity<?> updateEmployee(@PathVariable String userId, @RequestBody RegisterRequest req) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            if (!"EMPLOYEE".equals(user.getRole())) {
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("message", "Only employees can be updated"));
            }

            if (req.username != null && !req.username.isEmpty()) user.setUsername(req.username);
            if (req.email != null && !req.email.isEmpty()) user.setEmail(req.email);

            User updated = userRepository.save(user);
            updated.setPasswordHash(null);

            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }

    /** ✅ Google OAuth Login */
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String idToken = body.get("token");

        try {
            GoogleIdToken.Payload payload = authService.verifyGoogleToken(idToken);

            String email = payload.getEmail();
            String name = (String) payload.get("name");

            // If new user, create with CONSUMER role
            User user = authService.handleGoogleUser(name, email);

            // Generate JWT for frontend
            String jwt = jwtUtil.generateToken(user);

            user.setPasswordHash(null);
            return ResponseEntity.ok(new AuthResponse(jwt, user));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Collections.singletonMap("message", "Invalid Google token"));
        }
    }
}
