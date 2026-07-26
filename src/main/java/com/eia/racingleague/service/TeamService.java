package com.eia.racingleague.service;

import com.eia.racingleague.dto.team.TeamMemberResponse;
import com.eia.racingleague.dto.team.TeamRequest;
import com.eia.racingleague.dto.team.TeamResponse;
import com.eia.racingleague.exception.BusinessRuleException;
import com.eia.racingleague.exception.DuplicateResourceException;
import com.eia.racingleague.exception.ResourceNotFoundException;
import com.eia.racingleague.model.*;
import com.eia.racingleague.repository.CompetitorRepository;
import com.eia.racingleague.repository.TeamMemberRepository;
import com.eia.racingleague.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final CompetitorRepository competitorRepository;

    @Value("${team.max-members}")
    private int maxMembers;

    @Transactional
    public TeamResponse create(TeamRequest request) {
        if (teamRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("El nombre de equipo '" + request.getName() + "' ya está en uso");
        }

        Team team = Team.builder()
                .name(request.getName())
                .description(request.getDescription())
                .coachName(request.getCoachName())
                .status(TeamStatus.ACTIVE)
                .build();

        return toResponse(teamRepository.save(team));
    }

    public Page<TeamResponse> findAll(Pageable pageable) {
        return teamRepository.findAll(pageable).map(this::toResponse);
    }

    public TeamResponse findById(Long id) {
        return toResponse(getTeamOrThrow(id));
    }

    @Transactional
    public TeamResponse update(Long id, TeamRequest request) {
        Team team = getTeamOrThrow(id);

        if (teamRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new DuplicateResourceException("El nombre de equipo '" + request.getName() + "' ya está en uso");
        }

        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setCoachName(request.getCoachName());

        return toResponse(teamRepository.save(team));
    }

    @Transactional
    public void delete(Long id) {
        Team team = getTeamOrThrow(id);

        if (team.getVictories() + team.getDefeats() > 0) {
            // Tiene historial oficial de carreras: no se borra, se desactiva.
            team.setStatus(TeamStatus.INACTIVE);
            teamRepository.save(team);
            return;
        }

        teamRepository.delete(team);
    }

    @Transactional
    public TeamResponse addMember(Long teamId, Long competitorId) {
        Team team = getTeamOrThrow(teamId);

        if (team.getStatus() != TeamStatus.ACTIVE) {
            throw new BusinessRuleException("Solo se pueden agregar miembros a un equipo activo");
        }

        Competitor competitor = competitorRepository.findById(competitorId)
                .orElseThrow(() -> new ResourceNotFoundException("Competidor con ID " + competitorId + " no fue encontrado"));

        if (teamMemberRepository.existsByTeamIdAndCompetitorIdAndActiveTrue(teamId, competitorId)) {
            throw new BusinessRuleException("El competidor ya pertenece a este equipo");
        }

        teamMemberRepository.findByCompetitorIdAndActiveTrue(competitorId).ifPresent(existing -> {
            throw new BusinessRuleException("El competidor ya pertenece activamente a otro equipo");
        });

        int currentMembers = teamMemberRepository.countByTeamIdAndActiveTrue(teamId);
        if (currentMembers >= maxMembers) {
            throw new BusinessRuleException("El equipo alcanzó el número máximo de miembros (" + maxMembers + ")");
        }

        TeamMember member = TeamMember.builder()
                .team(team)
                .competitor(competitor)
                .active(true)
                .build();
        teamMemberRepository.save(member);

        return toResponse(team);
    }

    @Transactional
    public TeamResponse removeMember(Long teamId, Long competitorId) {
        Team team = getTeamOrThrow(teamId);

        TeamMember member = teamMemberRepository.findByTeamIdAndCompetitorIdAndActiveTrue(teamId, competitorId)
                .orElseThrow(() -> new ResourceNotFoundException("El competidor no es miembro activo de este equipo"));

        member.setActive(false);
        member.setRemovedAt(java.time.LocalDateTime.now());
        teamMemberRepository.save(member);

        return toResponse(team);
    }

    private Team getTeamOrThrow(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo con ID " + id + " no fue encontrado"));
    }

    private TeamResponse toResponse(Team team) {

        List<TeamMemberResponse> members =
                teamMemberRepository.findActiveMembersWithCompetitor(team.getId())
                        .stream()
                        .map(tm -> TeamMemberResponse.builder()
                                .competitorId(tm.getCompetitor().getId())
                                .competitorName(tm.getCompetitor().getName())
                                .competitorNickname(tm.getCompetitor().getNickname())
                                .build())
                        .toList();


        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .creationDate(team.getCreationDate())
                .status(team.getStatus())
                .coachName(team.getCoachName())
                .victories(team.getVictories())
                .defeats(team.getDefeats())
                .members(members)
                .build();
    }
}