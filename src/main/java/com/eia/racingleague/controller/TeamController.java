package com.eia.racingleague.controller;

import com.eia.racingleague.dto.team.TeamRequest;
import com.eia.racingleague.dto.team.TeamResponse;
import com.eia.racingleague.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<TeamResponse> create(@Valid @RequestBody TeamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<Page<TeamResponse>> findAll(Pageable pageable) {
        return ResponseEntity.ok(teamService.findAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'RACE_ORGANIZER')")
    public ResponseEntity<TeamResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<TeamResponse> update(@PathVariable Long id, @Valid @RequestBody TeamRequest request) {
        return ResponseEntity.ok(teamService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        teamService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/members/{competitorId}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<TeamResponse> addMember(@PathVariable Long teamId, @PathVariable Long competitorId) {
        return ResponseEntity.ok(teamService.addMember(teamId, competitorId));
    }

    @DeleteMapping("/{teamId}/members/{competitorId}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<TeamResponse> removeMember(@PathVariable Long teamId, @PathVariable Long competitorId) {
        return ResponseEntity.ok(teamService.removeMember(teamId, competitorId));
    }
}