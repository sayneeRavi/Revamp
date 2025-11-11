package com.revamp.customer.web;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

  @GetMapping("/whoami")
  public ResponseEntity<?> whoami() {
    var ctx = SecurityContextHolder.getContext().getAuthentication();
    return ResponseEntity.ok(Map.of(
        "principal", ctx == null ? null : ctx.getPrincipal(),
        "authorities", ctx == null ? null : ctx.getAuthorities()
    ));
  }
}
