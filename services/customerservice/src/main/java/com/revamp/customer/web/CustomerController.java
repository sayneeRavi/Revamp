package com.revamp.customer.web;

import com.revamp.customer.model.Customer;
import com.revamp.customer.repo.CustomerRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

  private final CustomerRepository customers;

  @GetMapping("/me")
  public ResponseEntity<?> me() {
    String uid = CurrentUser.userId();
    if (uid == null)
      return ResponseEntity.status(401).body("{\"error\":\"Unauthorized\"}");

    return customers.findByUserId(uid)
        .<ResponseEntity<?>>map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.status(404).body("{\"error\":\"Not Found\"}"));
  }

  @PutMapping("/me")
  public ResponseEntity<?> upsert(@Valid @RequestBody Customer body) {
    String uid = CurrentUser.userId();
    if (uid == null)
      return ResponseEntity.status(401).body("{\"error\":\"Unauthorized\"}");

    Customer c = customers.findByUserId(uid).orElseGet(Customer::new);
    c.setUserId(uid);
    if (body.getName() != null)
      c.setName(body.getName());
    if (body.getEmail() != null)
      c.setEmail(body.getEmail());
    if (body.getPhone() != null)
      c.setPhone(body.getPhone());
    if (body.getAddress() != null)
      c.setAddress(body.getAddress());
    if (body.getProfilePicture() != null)
      c.setProfilePicture(body.getProfilePicture());

    return ResponseEntity.ok(customers.save(c));
  }
}
