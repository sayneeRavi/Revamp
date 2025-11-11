package com.revamp.customer.web;

import com.revamp.customer.model.HistoryItem;
import com.revamp.customer.model.Vehicle;
import com.revamp.customer.repo.HistoryRepo;
import com.revamp.customer.repo.VehicleRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

  private final HistoryRepo history;
  private final VehicleRepo vehicles;

  @GetMapping
  public ResponseEntity<List<HistoryItem>> listMine() {
    String uid = CurrentUser.userId();
    if (uid == null) return ResponseEntity.status(401).build();
    return ResponseEntity.ok(history.findByCustomerUserId(uid));
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody HistoryItem body) {
    String uid = CurrentUser.userId();
    if (uid == null) return ResponseEntity.status(401).build();

    body.setId(null);
    body.setCustomerUserId(uid);

    // If a vehicleId is provided, verify ownership
    if (body.getVehicleId() != null && !body.getVehicleId().isBlank()) {
      Vehicle v = vehicles.findById(body.getVehicleId()).orElse(null);
      if (v == null || !uid.equals(v.getCustomerUserId())) {
        return ResponseEntity.status(403).body("{\"error\":\"Vehicle not owned by user\"}");
      }
      // populate denormalized fields (optional)
      body.setVehicleMake(v.getMake());
      body.setVehicleModel(v.getModel());
      body.setVehiclePlateNo(v.getPlateNo());
    }

    HistoryItem saved = history.save(body);
    return ResponseEntity.created(URI.create("/api/history/" + saved.getId())).body(saved);
  }
}
