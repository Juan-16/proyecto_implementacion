package com.eia.racingleague.controller;

import com.eia.racingleague.dto.race.RaceRequest;
import com.eia.racingleague.dto.race.RaceResponse;
import com.eia.racingleague.dto.race.RaceStatusUpdateRequest;
import com.eia.racingleague.model.RaceStatus;
import com.eia.racingleague.model.RaceType;
import com.eia.racingleague.service.RaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/races")
@RequiredArgsConstructor
public class RaceController {

    private final RaceService raceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<RaceResponse> create(@Valid @RequestBody RaceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(raceService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<RaceResponse>> findAll(
            @RequestParam(required = false) RaceType type,
            @RequestParam(required = false) RaceStatus status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(raceService.findAll(type, status, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RaceResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(raceService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<RaceResponse> update(@PathVariable Long id, @Valid @RequestBody RaceRequest request) {
        return ResponseEntity.ok(raceService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<RaceResponse> updateStatus(@PathVariable Long id,
                                                     @Valid @RequestBody RaceStatusUpdateRequest request) {
        return ResponseEntity.ok(raceService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        raceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}