package com.eia.racingleague.controller;

import com.eia.racingleague.dto.standing.CompetitorStandingResponse;
import com.eia.racingleague.dto.standing.TeamStandingResponse;
import com.eia.racingleague.service.StandingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/standings")
@RequiredArgsConstructor
public class StandingsController {

    private final StandingsService standingsService;

    @GetMapping("/competitors")
    public ResponseEntity<List<CompetitorStandingResponse>> competitorStandings() {
        return ResponseEntity.ok(standingsService.competitorStandings());
    }

    @GetMapping("/teams")
    public ResponseEntity<List<TeamStandingResponse>> teamStandings() {
        return ResponseEntity.ok(standingsService.teamStandings());
    }
}