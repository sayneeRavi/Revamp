package com.revamp.customer.web;

import com.revamp.customer.model.Vehicle;
import com.revamp.customer.repo.VehicleRepo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

  private final VehicleRepo vehicles;

  @GetMapping
  public ResponseEntity<List<Vehicle>> listMine() {
    String uid = CurrentUser.userId();
    if (uid == null)
      return ResponseEntity.status(401).build();
    return ResponseEntity.ok(vehicles.findByCustomerUserId(uid));
  }

  @PostMapping
  public ResponseEntity<Vehicle> create(@Valid @RequestBody Vehicle body) {
    String uid = CurrentUser.userId();
    if (uid == null)
      return ResponseEntity.status(401).build();

    body.setId(null);
    body.setCustomerUserId(uid);
    Vehicle saved = vehicles.save(body);
    return ResponseEntity.created(URI.create("/api/vehicles/" + saved.getId())).body(saved);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Vehicle> update(@PathVariable String id, @Valid @RequestBody Vehicle body) {
    String uid = CurrentUser.userId();
    if (uid == null)
      return ResponseEntity.status(401).build();

    var opt = vehicles.findById(id);
    if (!opt.isPresent())
      return ResponseEntity.notFound().build();
    var existing = opt.get();
    if (!uid.equals(existing.getCustomerUserId()))
      return ResponseEntity.status(403).build();

    existing.setMake(body.getMake());
    existing.setModel(body.getModel());
    existing.setPlateNo(body.getPlateNo());
    existing.setYear(body.getYear());
    Vehicle saved = vehicles.save(existing);
    return ResponseEntity.ok(saved);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable String id) {
    String uid = CurrentUser.userId();
    if (uid == null)
      return ResponseEntity.status(401).build();

    return vehicles.findById(id)
        .map(existing -> {
          if (!uid.equals(existing.getCustomerUserId())) {
            return ResponseEntity.status(403).build();
          }
          vehicles.delete(existing);
          return ResponseEntity.noContent().build();
        })
        .orElseGet(() -> ResponseEntity.notFound().build());
  }
}
