package com.eia.racingleague.service;

import com.eia.racingleague.dto.registration.*;
import com.eia.racingleague.exception.BusinessRuleException;
import com.eia.racingleague.exception.ResourceNotFoundException;
import com.eia.racingleague.model.*;
import com.eia.racingleague.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RaceRegistrationService {

    private static final List<RegistrationStatus> ACTIVE_STATUSES =
            List.of(RegistrationStatus.PENDING, RegistrationStatus.APPROVED);

    private final RaceRegistrationRepository registrationRepository;
    private final RaceRepository raceRepository;
    private final CompetitorRepository competitorRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final AuditService auditService;

    @Transactional
    public RaceRegistrationResponse register(Long raceId, RaceRegistrationRequest request, String username) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new ResourceNotFoundException("Carrera con ID " + raceId + " no fue encontrada"));

        boolean hasCompetitor = request.getCompetitorId() != null;
        boolean hasTeam = request.getTeamId() != null;

        if (hasCompetitor == hasTeam) {
            throw new BusinessRuleException("Debe indicar exactamente un competidor o un equipo, no ambos ni ninguno");
        }

        validateRaceIsOpenForRegistration(race);

        if (hasCompetitor) {
            return registerCompetitor(race, request, username);
        } else {
            return registerTeam(race, request, username);
        }
    }

    private RaceRegistrationResponse registerCompetitor(Race race, RaceRegistrationRequest request, String username) {
        if (race.getRaceType() == RaceType.TEAM) {
            throw new BusinessRuleException("Esta carrera es de tipo TEAM; solo se aceptan inscripciones de equipos");
        }

        Competitor competitor = competitorRepository.findById(request.getCompetitorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Competidor con ID " + request.getCompetitorId() + " no fue encontrado"));

        if (competitor.getStatus() != CompetitorStatus.ACTIVE) {
            throw new BusinessRuleException("Solo competidores ACTIVE pueden inscribirse en una carrera");
        }

        if (registrationRepository.existsByRaceIdAndCompetitorIdAndStatusIn(
                race.getId(), competitor.getId(), ACTIVE_STATUSES)) {
            throw new BusinessRuleException("Este competidor ya está inscrito en esta carrera");
        }

        // Un competidor no puede correr individual y como miembro de equipo en la misma carrera.
        if (isCompetitorRegisteredAsTeamMember(race.getId(), competitor.getId())) {
            throw new BusinessRuleException(
                    "El competidor ya está inscrito como parte de un equipo en esta carrera");
        }

        RaceRegistration registration = RaceRegistration.builder()
                .race(race)
                .competitor(competitor)
                .validationNotes(request.getValidationNotes())
                .registeredBy(username)
                .status(RegistrationStatus.PENDING)
                .build();

        return toResponse(registrationRepository.save(registration));
    }

    private RaceRegistrationResponse registerTeam(Race race, RaceRegistrationRequest request, String username) {
        if (race.getRaceType() == RaceType.INDIVIDUAL) {
            throw new BusinessRuleException("Esta carrera es de tipo INDIVIDUAL; solo se aceptan inscripciones de competidores");
        }

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Equipo con ID " + request.getTeamId() + " no fue encontrado"));

        if (team.getStatus() != TeamStatus.ACTIVE) {
            throw new BusinessRuleException("Un equipo suspendido o inactivo no puede inscribirse en una carrera");
        }

        List<TeamMember> members = teamMemberRepository.findActiveMembersWithCompetitor(team.getId());
        if (members.isEmpty()) {
            throw new BusinessRuleException("El equipo debe tener al menos un competidor antes de inscribirse");
        }

        for (TeamMember member : members) {
            if (member.getCompetitor().getStatus() != CompetitorStatus.ACTIVE) {
                throw new BusinessRuleException(
                        "Todos los miembros del equipo deben estar ACTIVE (revisar: " +
                                member.getCompetitor().getNickname() + ")");
            }
            if (registrationRepository.existsByRaceIdAndCompetitorIdAndStatusIn(
                    race.getId(), member.getCompetitor().getId(), ACTIVE_STATUSES)) {
                throw new BusinessRuleException(
                        "El miembro " + member.getCompetitor().getNickname() +
                                " ya está inscrito individualmente en esta carrera");
            }
        }

        if (registrationRepository.existsByRaceIdAndTeamIdAndStatusIn(race.getId(), team.getId(), ACTIVE_STATUSES)) {
            throw new BusinessRuleException("Este equipo ya está inscrito en esta carrera");
        }

        RaceRegistration registration = RaceRegistration.builder()
                .race(race)
                .team(team)
                .validationNotes(request.getValidationNotes())
                .registeredBy(username)
                .status(RegistrationStatus.PENDING)
                .build();

        return toResponse(registrationRepository.save(registration));
    }

    private boolean isCompetitorRegisteredAsTeamMember(Long raceId, Long competitorId) {
        List<RaceRegistration> teamRegistrations = registrationRepository.findActiveByRaceId(raceId, ACTIVE_STATUSES)
                .stream()
                .filter(r -> r.getTeam() != null)
                .toList();

        for (RaceRegistration reg : teamRegistrations) {
            boolean isMember = teamMemberRepository.findActiveMembersWithCompetitor(reg.getTeam().getId()).stream()
                    .anyMatch(tm -> tm.getCompetitor().getId().equals(competitorId));
            if (isMember) {
                return true;
            }
        }
        return false;
    }

    private void validateRaceIsOpenForRegistration(Race race) {
        if (race.getStatus() != RaceStatus.OPEN_FOR_REGISTRATION) {
            throw new BusinessRuleException("La carrera no está abierta para inscripciones");
        }
        if (LocalDateTime.now().isAfter(race.getRegistrationDeadline())) {
            throw new BusinessRuleException("La fecha límite de inscripción ya pasó");
        }
    }

    public Page<RaceRegistrationResponse> findByRace(Long raceId, Pageable pageable) {
        return registrationRepository.findByRaceId(raceId, pageable).map(this::toResponse);
    }

    public RaceRegistrationResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public RaceRegistrationResponse approve(Long id, RegistrationApproveRequest request) {
        RaceRegistration registration = getOrThrow(id);

        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new BusinessRuleException("Solo se pueden aprobar inscripciones en estado PENDING");
        }

        Race race = registration.getRace();

        int approvedCount = registrationRepository.countByRaceIdAndStatus(race.getId(), RegistrationStatus.APPROVED);
        if (approvedCount >= race.getMaxParticipants()) {
            throw new BusinessRuleException("Se alcanzó el número máximo de participantes para esta carrera");
        }

        Integer position = request.getStartingPosition();
        if (position != null) {
            if (registrationRepository.existsByRaceIdAndStartingPositionAndStatus(
                    race.getId(), position, RegistrationStatus.APPROVED)) {
                throw new BusinessRuleException("La posición de salida " + position + " ya está asignada");
            }
        } else {
            position = approvedCount + 1;
        }

        registration.setStatus(RegistrationStatus.APPROVED);
        registration.setStartingPosition(position);

        RaceRegistration saved = registrationRepository.save(registration);
        auditService.log("REGISTRATION_APPROVED", "RaceRegistration", id.toString(),
                "Inscripción aprobada, posición asignada: " + saved.getStartingPosition());
        return toResponse(saved);
    }

    @Transactional
    public RaceRegistrationResponse reject(Long id, RegistrationRejectRequest request) {
        RaceRegistration registration = getOrThrow(id);

        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new BusinessRuleException("Solo se pueden rechazar inscripciones en estado PENDING");
        }

        registration.setStatus(RegistrationStatus.REJECTED);
        registration.setRejectionReason(request.getReason());

        RaceRegistration saved = registrationRepository.save(registration);
        auditService.log("REGISTRATION_REJECTED", "RaceRegistration", id.toString(),
                "Inscripción rechazada: " + request.getReason());
        return toResponse(saved);
    }

    @Transactional
    public void cancel(Long id) {
        RaceRegistration registration = getOrThrow(id);

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            return;
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        registrationRepository.save(registration);
    }

    private RaceRegistration getOrThrow(Long id) {
        return registrationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripción con ID " + id + " no fue encontrada"));
    }

    private RaceRegistrationResponse toResponse(RaceRegistration r) {
        return RaceRegistrationResponse.builder()
                .id(r.getId())
                .raceId(r.getRace().getId())
                .raceName(r.getRace().getName())
                .competitorId(r.getCompetitor() != null ? r.getCompetitor().getId() : null)
                .competitorName(r.getCompetitor() != null ? r.getCompetitor().getName() : null)
                .teamId(r.getTeam() != null ? r.getTeam().getId() : null)
                .teamName(r.getTeam() != null ? r.getTeam().getName() : null)
                .registeredAt(r.getRegisteredAt())
                .status(r.getStatus())
                .startingPosition(r.getStartingPosition())
                .validationNotes(r.getValidationNotes())
                .rejectionReason(r.getRejectionReason())
                .registeredBy(r.getRegisteredBy())
                .build();
    }
}