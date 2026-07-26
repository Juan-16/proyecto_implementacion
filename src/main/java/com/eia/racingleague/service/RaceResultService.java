package com.eia.racingleague.service;

import com.eia.racingleague.dto.result.RaceResultRequest;
import com.eia.racingleague.dto.result.RaceResultResponse;
import com.eia.racingleague.exception.BusinessRuleException;
import com.eia.racingleague.exception.ResourceNotFoundException;
import com.eia.racingleague.model.*;
import com.eia.racingleague.repository.CompetitorRepository;
import com.eia.racingleague.repository.RaceRegistrationRepository;
import com.eia.racingleague.repository.RaceResultRepository;
import com.eia.racingleague.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RaceResultService {

    private final RaceResultRepository resultRepository;
    private final RaceRegistrationRepository registrationRepository;
    private final CompetitorRepository competitorRepository;
    private final TeamRepository teamRepository;
    private final AuditService auditService;

    @Transactional
    public RaceResultResponse create(Long raceId, RaceResultRequest request, String username) {
        RaceRegistration registration = registrationRepository.findByIdWithDetails(request.getRegistrationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inscripción con ID " + request.getRegistrationId() + " no fue encontrada"));

        Race race = registration.getRace();

        if (!race.getId().equals(raceId)) {
            throw new BusinessRuleException("La inscripción no pertenece a la carrera indicada");
        }

        if (race.getStatus() != RaceStatus.IN_PROGRESS) {
            throw new BusinessRuleException("Solo se pueden registrar resultados para una carrera IN_PROGRESS");
        }

        if (registration.getStatus() != RegistrationStatus.APPROVED) {
            throw new BusinessRuleException("Solo participantes con inscripción APPROVED pueden recibir resultado");
        }

        if (resultRepository.existsByRegistrationId(registration.getId())) {
            throw new BusinessRuleException("Esta inscripción ya tiene un resultado registrado");
        }

        validateResultConsistency(raceId, null, request);

        RaceResult result = RaceResult.builder()
                .race(race)
                .registration(registration)
                .startingPosition(registration.getStartingPosition())
                .finalPosition(request.getFinalPosition())
                .completionTimeSeconds(request.getCompletionTimeSeconds())
                .penaltyTimeSeconds(request.getPenaltyTimeSeconds() != null ? request.getPenaltyTimeSeconds() : 0.0)
                .status(request.getStatus())
                .notes(request.getNotes())
                .recordedBy(username)
                .build();

        RaceResult saved = resultRepository.save(result);
        applyStatisticsUpdate(saved, +1);

        auditService.log("RESULT_RECORDED", "RaceResult", saved.getId().toString(),
                "Resultado registrado, posición final: " + saved.getFinalPosition());

        return toResponse(saved);
    }

    @Transactional
    public RaceResultResponse update(Long id, RaceResultRequest request) {
        RaceResult result = resultRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resultado con ID " + id + " no fue encontrado"));

        // Revertimos las estadísticas anteriores antes de aplicar las nuevas,
        // para que la actualización sea consistente.
        applyStatisticsUpdate(result, -1);

        validateResultConsistency(result.getRace().getId(), id, request);

        result.setFinalPosition(request.getFinalPosition());
        result.setCompletionTimeSeconds(request.getCompletionTimeSeconds());
        result.setPenaltyTimeSeconds(request.getPenaltyTimeSeconds() != null ? request.getPenaltyTimeSeconds() : 0.0);
        result.setStatus(request.getStatus());
        result.setNotes(request.getNotes());

        RaceResult saved = resultRepository.save(result);
        applyStatisticsUpdate(saved, +1);

        auditService.log("RESULT_UPDATED", "RaceResult", saved.getId().toString(),
                "Resultado actualizado, nueva posición final: " + saved.getFinalPosition());

        return toResponse(saved);
    }

    private void validateResultConsistency(Long raceId, Long excludeResultId, RaceResultRequest request) {
        if (request.getStatus() == ResultStatus.FINISHED) {
            if (request.getFinalPosition() == null) {
                throw new BusinessRuleException("Un resultado FINISHED requiere una posición final");
            }
            boolean duplicated = excludeResultId == null
                    ? resultRepository.existsByRaceIdAndFinalPositionAndStatus(
                    raceId, request.getFinalPosition(), ResultStatus.FINISHED)
                    : resultRepository.findByRaceId(raceId).stream()
                    .anyMatch(r -> !r.getId().equals(excludeResultId)
                            && r.getStatus() == ResultStatus.FINISHED
                            && request.getFinalPosition().equals(r.getFinalPosition()));

            if (duplicated) {
                throw new BusinessRuleException(
                        "La posición final " + request.getFinalPosition() + " ya fue asignada a otro participante");
            }

            if (request.getFinalPosition() == 1) {
                boolean anotherWinnerExists = resultRepository.findByRaceId(raceId).stream()
                        .anyMatch(r -> (excludeResultId == null || !r.getId().equals(excludeResultId))
                                && r.getFinalPosition() != null
                                && r.getFinalPosition() == 1
                                && r.getStatus() == ResultStatus.FINISHED);
                if (anotherWinnerExists) {
                    throw new BusinessRuleException("Ya existe un ganador oficial para esta carrera");
                }
            }
        }

        if (request.getStatus() == ResultStatus.DISQUALIFIED && Integer.valueOf(1).equals(request.getFinalPosition())) {
            throw new BusinessRuleException("Un participante descalificado no puede ser declarado ganador");
        }
    }

    /**
     * direction = +1 para aplicar el efecto de un resultado nuevo/actualizado,
     * direction = -1 para revertir el efecto anterior antes de aplicar uno nuevo.
     */
    private void applyStatisticsUpdate(RaceResult result, int direction) {
        RaceRegistration registration = result.getRegistration();
        boolean won = result.getStatus() == ResultStatus.FINISHED
                && Integer.valueOf(1).equals(result.getFinalPosition());
        boolean lost = result.getStatus() == ResultStatus.FINISHED && !won;

        if (registration.getCompetitor() != null) {
            Competitor c = competitorRepository.findById(registration.getCompetitor().getId()).orElseThrow();
            if (won) c.setVictories(c.getVictories() + direction);
            if (lost) c.setDefeats(c.getDefeats() + direction);
            if (result.getStatus() == ResultStatus.FINISHED) {
                c.setRacesCompleted(c.getRacesCompleted() + direction);
            }
            competitorRepository.save(c);
        }

        if (registration.getTeam() != null) {
            Team t = teamRepository.findById(registration.getTeam().getId()).orElseThrow();
            if (won) t.setVictories(t.getVictories() + direction);
            if (lost) t.setDefeats(t.getDefeats() + direction);
            teamRepository.save(t);
        }
    }

    public List<RaceResultResponse> findByRace(Long raceId) {
        return resultRepository.findByRaceId(raceId).stream().map(this::toResponse).toList();
    }

    public RaceResultResponse findById(Long id) {
        RaceResult result = resultRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resultado con ID " + id + " no fue encontrado"));
        return toResponse(result);
    }

    /** Usado por RaceService para validar que una carrera tenga resultados antes de completarse. */
    public boolean hasResults(Long raceId) {
        return resultRepository.countByRaceId(raceId) > 0;
    }

    private RaceResultResponse toResponse(RaceResult r) {
        RaceRegistration reg = r.getRegistration();
        String participantName = reg.getCompetitor() != null
                ? reg.getCompetitor().getName()
                : reg.getTeam().getName();

        return RaceResultResponse.builder()
                .id(r.getId())
                .raceId(r.getRace().getId())
                .registrationId(reg.getId())
                .participantName(participantName)
                .startingPosition(r.getStartingPosition())
                .finalPosition(r.getFinalPosition())
                .completionTimeSeconds(r.getCompletionTimeSeconds())
                .penaltyTimeSeconds(r.getPenaltyTimeSeconds())
                .status(r.getStatus())
                .notes(r.getNotes())
                .recordedBy(r.getRecordedBy())
                .recordedAt(r.getRecordedAt())
                .points(PointsCalculator.pointsFor(r.getFinalPosition(), r.getStatus()))
                .build();
    }
}