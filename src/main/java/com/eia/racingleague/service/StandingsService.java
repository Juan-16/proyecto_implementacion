package com.eia.racingleague.service;

import com.eia.racingleague.dto.standing.CompetitorStandingResponse;
import com.eia.racingleague.dto.standing.TeamStandingResponse;
import com.eia.racingleague.model.Competitor;
import com.eia.racingleague.model.Team;
import com.eia.racingleague.repository.CompetitorRepository;
import com.eia.racingleague.repository.TeamRepository;
import com.eia.racingleague.repository.RaceResultRepository;
import com.eia.racingleague.model.RaceResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StandingsService {

    private final CompetitorRepository competitorRepository;
    private final TeamRepository teamRepository;
    private final RaceResultRepository raceResultRepository;

    public List<CompetitorStandingResponse> competitorStandings() {
        Map<Long, Integer> pointsByCompetitor = new HashMap<>();

        for (RaceResult result : raceResultRepository.findAllWithRegistrationDetails()) {
            var registration = result.getRegistration();
            if (registration.getCompetitor() == null) continue;
            Long competitorId = registration.getCompetitor().getId();
            int points = PointsCalculator.pointsFor(result.getFinalPosition(), result.getStatus());
            pointsByCompetitor.merge(competitorId, points, Integer::sum);
        }

        return competitorRepository.findAll().stream()
                .map(c -> CompetitorStandingResponse.builder()
                        .competitorId(c.getId())
                        .name(c.getName())
                        .nickname(c.getNickname())
                        .victories(c.getVictories())
                        .defeats(c.getDefeats())
                        .racesCompleted(c.getRacesCompleted())
                        .totalPoints(pointsByCompetitor.getOrDefault(c.getId(), 0))
                        .build())
                .sorted(Comparator.comparingInt(CompetitorStandingResponse::getTotalPoints).reversed())
                .toList();
    }

    public List<TeamStandingResponse> teamStandings() {
        Map<Long, Integer> pointsByTeam = new HashMap<>();

        for (RaceResult result : raceResultRepository.findAllWithRegistrationDetails()) {
            var registration = result.getRegistration();
            if (registration.getTeam() == null) continue;
            Long teamId = registration.getTeam().getId();
            int points = PointsCalculator.pointsFor(result.getFinalPosition(), result.getStatus());
            pointsByTeam.merge(teamId, points, Integer::sum);
        }

        return teamRepository.findAll().stream()
                .map(t -> TeamStandingResponse.builder()
                        .teamId(t.getId())
                        .name(t.getName())
                        .victories(t.getVictories())
                        .defeats(t.getDefeats())
                        .totalPoints(pointsByTeam.getOrDefault(t.getId(), 0))
                        .build())
                .sorted(Comparator.comparingInt(TeamStandingResponse::getTotalPoints).reversed())
                .toList();
    }
}