package com.eia.racingleague.controller;

import com.eia.racingleague.dto.result.RaceResultRequest;
import com.eia.racingleague.dto.result.RaceResultResponse;
import com.eia.racingleague.service.RaceResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RaceResultController {

    private final RaceResultService raceResultService;

    @PostMapping("/api/races/{raceId}/results")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<RaceResultResponse> create(
            @PathVariable Long raceId,
            @Valid @RequestBody RaceResultRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        RaceResultResponse response = raceResultService.create(raceId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/races/{raceId}/results")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER', 'VIEWER')")
    public ResponseEntity<List<RaceResultResponse>> findByRace(@PathVariable Long raceId) {
        return ResponseEntity.ok(raceResultService.findByRace(raceId));
    }

    @PutMapping("/api/results/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<RaceResultResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody RaceResultRequest request) {
        return ResponseEntity.ok(raceResultService.update(id, request));
    }

    @GetMapping("/api/results/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER','VIEWER')")
    public ResponseEntity<RaceResultResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(raceResultService.findById(id));
    }
}