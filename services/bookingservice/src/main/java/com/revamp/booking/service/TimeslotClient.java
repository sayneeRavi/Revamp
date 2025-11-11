package com.revamp.booking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class TimeslotClient {
    private final RestClient restClient = RestClient.create();

    @Value("${timeslot.api.base}")
    private String base;

    public List<Map<String, Object>> checkAvailability(String date) {
        return restClient.get()
                .uri(base + "/api/bookings/timeslots/check-availability/" + date)
                .retrieve()
                .body(List.class);
    }

    public boolean bookSlot(String slotId) {
        // Assumes timeslot-service exposes an atomic book endpoint
        try {
            Map result = restClient.post()
                    .uri(base + "/api/bookings/timeslots/" + slotId + "/book")
                    .retrieve()
                    .body(Map.class);
            return result != null && Boolean.TRUE.equals(result.get("success"));
        } catch (Exception e) {
            return false;
        }
    }
}
