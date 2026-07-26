package com.eia.racingleague.controller;

import com.eia.racingleague.dto.competitor.CompetitorRequest;
import com.eia.racingleague.dto.competitor.CompetitorResponse;
import com.eia.racingleague.dto.competitor.CompetitorStatusUpdateRequest;
import com.eia.racingleague.model.CompetitorStatus;
import com.eia.racingleague.model.CompetitorType;
import com.eia.racingleague.service.CompetitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/competitors")
@RequiredArgsConstructor
public class CompetitorController {

    private final CompetitorService competitorService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<CompetitorResponse> create(@Valid @RequestBody CompetitorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(competitorService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<Page<CompetitorResponse>> findAll(
            @RequestParam(required = false) CompetitorType type,
            @RequestParam(required = false) CompetitorStatus status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(competitorService.findAll(type, status, search, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<CompetitorResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(competitorService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<CompetitorResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody CompetitorRequest request) {
        return ResponseEntity.ok(competitorService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<CompetitorResponse> updateStatus(@PathVariable Long id,
                                                           @Valid @RequestBody CompetitorStatusUpdateRequest request) {
        return ResponseEntity.ok(competitorService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        competitorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}