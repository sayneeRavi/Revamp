package com.revamp.customer.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  @Value("${jwt.secret}")
  private String secret; // MUST match authservice property name

  private String extractUserId(Claims claims) {
    // Try common keys used by different auth services
    String uid = claims.getSubject();
    if (uid == null) {
      Object v = claims.get("userId");
      if (v == null) v = claims.get("id");
      if (v == null) v = claims.get("uid");
      if (v == null) v = claims.get("username");
      uid = v == null ? null : String.valueOf(v);
    }
    return (uid == null || uid.isBlank()) ? null : uid;
  }

  @SuppressWarnings("unchecked")
  private Collection<SimpleGrantedAuthority> extractAuthorities(Claims claims) {
    List<SimpleGrantedAuthority> out = new ArrayList<>();
    // roles may be in "roles": ["USER","ADMIN"] or "authorities": [...]
    Object roles = claims.get("roles");
    if (roles instanceof List<?> list) {
      for (Object r : list) out.add(new SimpleGrantedAuthority("ROLE_" + String.valueOf(r)));
    }
    // Check for "role" (singular) - used by authservice
    Object role = claims.get("role");
    if (role != null) {
      out.add(new SimpleGrantedAuthority("ROLE_" + String.valueOf(role)));
    }
    Object auths = claims.get("authorities");
    if (auths instanceof List<?> list) {
      for (Object a : list) out.add(new SimpleGrantedAuthority(String.valueOf(a)));
    }
    if (out.isEmpty()) out.add(new SimpleGrantedAuthority("ROLE_USER"));
    return out;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {

    String auth = req.getHeader(HttpHeaders.AUTHORIZATION);
    if (auth == null || !auth.startsWith("Bearer ")) {
      chain.doFilter(req, res);
      return;
    }

    try {
      SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

      Claims claims = Jwts.parser()
          .verifyWith(key)           // HS256 verification
          .build()
          .parseSignedClaims(auth.substring(7))
          .getPayload();

      String uid = extractUserId(claims);
      if (uid != null) {
        var authorities = extractAuthorities(claims);
        var token = new UsernamePasswordAuthenticationToken(uid, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(token);
      } else {
        SecurityContextHolder.clearContext(); // no principal found
      }
    } catch (Exception e) {
      // Invalid/expired token → continue without authentication
      System.err.println("[JwtAuthFilter] Token validation failed: " + e.getMessage());
      e.printStackTrace();
      SecurityContextHolder.clearContext();
    }

    chain.doFilter(req, res);
  }
}
