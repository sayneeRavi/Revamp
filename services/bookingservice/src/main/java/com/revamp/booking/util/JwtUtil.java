package com.revamp.booking.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims parseToken(String token) {
        try {
            System.out.println("[JwtUtil] Parsing token...");
            System.out.println("[JwtUtil] JWT Secret configured: " + (jwtSecret != null && !jwtSecret.isEmpty()));
            System.out.println("[JwtUtil] JWT Secret length: " + (jwtSecret != null ? jwtSecret.length() : 0));
            
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            System.out.println("[JwtUtil] Token length: " + (token != null ? token.length() : 0));
            
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSecretKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            System.out.println("[JwtUtil] Token parsed successfully");
            return claims;
        } catch (Exception e) {
            System.err.println("[JwtUtil] Error parsing token: " + e.getMessage());
            System.err.println("[JwtUtil] Exception type: " + e.getClass().getName());
            e.printStackTrace();
            throw e;
        }
    }

    public String getCustomerId(Claims claims) {
        String subject = claims.getSubject();
        System.out.println("[JwtUtil] getCustomerId - subject: " + subject);
        return subject;
    }

    public String getCustomerName(Claims claims) {
        String username = claims.get("username", String.class);
        System.out.println("[JwtUtil] getCustomerName - username: " + username);
        return username;
    }

    public String getCustomerEmail(Claims claims) {
        String email = claims.get("email", String.class);
        System.out.println("[JwtUtil] getCustomerEmail - email: " + email);
        return email;
    }

    public String getRole(Claims claims) {
        String role = claims.get("role", String.class);
        if (role == null) {
            // Try roles array
            Object roles = claims.get("roles");
            if (roles instanceof java.util.List) {
                java.util.List<?> rolesList = (java.util.List<?>) roles;
                if (!rolesList.isEmpty()) {
                    role = String.valueOf(rolesList.get(0));
                }
            }
        }
        return role;
    }

    public boolean isAdmin(Claims claims) {
        String role = getRole(claims);
        return "ADMIN".equalsIgnoreCase(role);
    }
}

