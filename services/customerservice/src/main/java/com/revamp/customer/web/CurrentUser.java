package com.revamp.customer.web;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {
  private CurrentUser() {}
  public static String userId() {
    Authentication a = SecurityContextHolder.getContext().getAuthentication();
    if (a == null || a.getPrincipal() == null) return null;
    Object p = a.getPrincipal();
    return (p instanceof String s) ? s : p.toString();
  }
}
