package com.eia.racingleague.controller;

import com.eia.racingleague.dto.registration.*;
import com.eia.racingleague.service.RaceRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class RaceRegistrationController {

    private final RaceRegistrationService registrationService;

    @PostMapping("/api/races/{raceId}/registrations")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<RaceRegistrationResponse> register(
            @PathVariable Long raceId,
            @RequestBody RaceRegistrationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        RaceRegistrationResponse response =
                registrationService.register(raceId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/races/{raceId}/registrations")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<Page<RaceRegistrationResponse>> findByRace(
            @PathVariable Long raceId, Pageable pageable) {
        return ResponseEntity.ok(registrationService.findByRace(raceId, pageable));
    }

    @GetMapping("/api/registrations/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<RaceRegistrationResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(registrationService.findById(id));
    }

    @PatchMapping("/api/registrations/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<RaceRegistrationResponse> approve(
            @PathVariable Long id, @RequestBody(required = false) RegistrationApproveRequest request) {
        RegistrationApproveRequest body = request != null ? request : new RegistrationApproveRequest();
        return ResponseEntity.ok(registrationService.approve(id, body));
    }

    @PatchMapping("/api/registrations/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<RaceRegistrationResponse> reject(
            @PathVariable Long id, @Valid @RequestBody RegistrationRejectRequest request) {
        return ResponseEntity.ok(registrationService.reject(id, request));
    }

    @DeleteMapping("/api/registrations/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        registrationService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}