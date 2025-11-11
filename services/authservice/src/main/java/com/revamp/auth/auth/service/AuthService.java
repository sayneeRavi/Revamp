package com.revamp.auth.auth.service;

import java.util.Collections;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.revamp.auth.auth.model.User;
import com.revamp.auth.auth.repository.UserRepository;
import com.revamp.auth.auth.util.JwtUtil;

@Service
public class AuthService {

    @Value("${google.client.id:}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtUtil = jwtUtil;
    }

    /** ✅ Change Password */
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /** ✅ Verify Google OAuth Token */
    public GoogleIdToken.Payload verifyGoogleToken(String idTokenString) throws Exception {
        if (googleClientId == null || googleClientId.isEmpty() || googleClientId.equals("YOUR_GOOGLE_CLIENT_ID_HERE")) {
            throw new Exception("Google OAuth is not configured. Please set google.client.id in application.properties");
        }
        
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                new JacksonFactory()
        ).setAudience(Collections.singletonList(googleClientId)).build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken != null) {
            return idToken.getPayload();
        } else {
            throw new Exception("Invalid ID token");
        }
    }

    /** ✅ Handle new or existing Google user */
    public User handleGoogleUser(String name, String email) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            return existing.get();
        }

        User newUser = new User();
        newUser.setUsername(name);
        newUser.setEmail(email);
        newUser.setRole("CONSUMER");
        newUser.setEnabled(true);
        return userRepository.save(newUser);
    }

    /** ✅ Register new user (email/password) */
    public User register(String username, String email, String rawPassword, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }

        String hashed = passwordEncoder.encode(rawPassword);
        User user = new User(username, email, hashed, role != null ? role : "CONSUMER");
        return userRepository.save(user);
    }

    /** ✅ Login existing user */
    public String login(String email, String rawPassword) {
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }

        User user = opt.get();
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtUtil.generateToken(user);
    }

    /** ✅ Get user by email */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /** ✅ Update username by email */
    public User updateUsernameByEmail(String email, String newUsername) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(newUsername);
        return userRepository.save(user);
    }
}
