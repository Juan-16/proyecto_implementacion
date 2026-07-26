package com.eia.racingleague.service;

import com.eia.racingleague.dto.race.RaceRequest;
import com.eia.racingleague.dto.race.RaceResponse;
import com.eia.racingleague.dto.race.RaceStatusUpdateRequest;
import com.eia.racingleague.exception.BusinessRuleException;
import com.eia.racingleague.exception.ResourceNotFoundException;
import com.eia.racingleague.model.Race;
import com.eia.racingleague.model.RaceStatus;
import com.eia.racingleague.model.RaceType;
import com.eia.racingleague.repository.RaceRepository;
import com.eia.racingleague.service.spec.RaceSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RaceService {

    private final RaceRepository raceRepository;
    private final RaceResultService raceResultService;
    private final AuditService auditService;

    // Máquina de estados: qué transiciones son válidas desde cada estado.
    private static final Map<RaceStatus, Set<RaceStatus>> VALID_TRANSITIONS = new EnumMap<>(RaceStatus.class);

    static {
        VALID_TRANSITIONS.put(RaceStatus.DRAFT, EnumSet.of(RaceStatus.OPEN_FOR_REGISTRATION, RaceStatus.CANCELLED));
        VALID_TRANSITIONS.put(RaceStatus.OPEN_FOR_REGISTRATION, EnumSet.of(RaceStatus.CLOSED_FOR_REGISTRATION, RaceStatus.CANCELLED));
        VALID_TRANSITIONS.put(RaceStatus.CLOSED_FOR_REGISTRATION, EnumSet.of(RaceStatus.IN_PROGRESS, RaceStatus.CANCELLED));
        VALID_TRANSITIONS.put(RaceStatus.IN_PROGRESS, EnumSet.of(RaceStatus.COMPLETED, RaceStatus.CANCELLED));
        VALID_TRANSITIONS.put(RaceStatus.COMPLETED, EnumSet.noneOf(RaceStatus.class));
        VALID_TRANSITIONS.put(RaceStatus.CANCELLED, EnumSet.noneOf(RaceStatus.class));
    }

    @Transactional
    public RaceResponse create(RaceRequest request) {
        validateDeadlineBeforeStart(request.getRegistrationDeadline(), request.getScheduledAt());

        Race race = Race.builder()
                .name(request.getName())
                .description(request.getDescription())
                .scheduledAt(request.getScheduledAt())
                .startLocation(request.getStartLocation())
                .finishLocation(request.getFinishLocation())
                .distanceMeters(request.getDistanceMeters())
                .maxParticipants(request.getMaxParticipants())
                .raceType(request.getRaceType())
                .organizer(request.getOrganizer())
                .registrationDeadline(request.getRegistrationDeadline())
                .status(RaceStatus.DRAFT)
                .build();

        return toResponse(raceRepository.save(race));
    }

    public Page<RaceResponse> findAll(RaceType type, RaceStatus status, String search, Pageable pageable) {
        Specification<Race> spec = Specification.where(RaceSpecifications.hasType(type))
                .and(RaceSpecifications.hasStatus(status))
                .and(RaceSpecifications.nameContains(search));

        return raceRepository.findAll(spec, pageable).map(this::toResponse);
    }

    public RaceResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public RaceResponse update(Long id, RaceRequest request) {
        Race race = getOrThrow(id);

        if (race.getStatus() == RaceStatus.COMPLETED) {
            throw new BusinessRuleException("Una carrera completada no puede ser editada");
        }

        validateDeadlineBeforeStart(request.getRegistrationDeadline(), request.getScheduledAt());

        race.setName(request.getName());
        race.setDescription(request.getDescription());
        race.setScheduledAt(request.getScheduledAt());
        race.setStartLocation(request.getStartLocation());
        race.setFinishLocation(request.getFinishLocation());
        race.setDistanceMeters(request.getDistanceMeters());
        race.setMaxParticipants(request.getMaxParticipants());
        race.setRaceType(request.getRaceType());
        race.setOrganizer(request.getOrganizer());
        race.setRegistrationDeadline(request.getRegistrationDeadline());

        return toResponse(raceRepository.save(race));
    }

    @Transactional
    public RaceResponse updateStatus(Long id, RaceStatusUpdateRequest request) {
        Race race = getOrThrow(id);
        RaceStatus current = race.getStatus();
        RaceStatus target = request.getStatus();

        if (current == target) {
            return toResponse(race);
        }

        Set<RaceStatus> allowed = VALID_TRANSITIONS.getOrDefault(current, EnumSet.noneOf(RaceStatus.class));
        if (!allowed.contains(target)) {
            throw new BusinessRuleException(
                    "Transición de estado inválida: no se puede pasar de " + current + " a " + target);
        }
        if (target == RaceStatus.COMPLETED && !raceResultService.hasResults(id)) {
            throw new BusinessRuleException("Una carrera no puede completarse sin resultados oficiales registrados");
        }

        race.setStatus(target);
        Race saved = raceRepository.save(race);
        if (target == RaceStatus.CANCELLED) {
            auditService.log("RACE_CANCELLED", "Race", id.toString(),
                    "Carrera cancelada", current.name(), target.name());
        } else {
            auditService.log("RACE_STATUS_CHANGED", "Race", id.toString(),
                    "Cambio de estado de carrera", current.name(), target.name());
        }
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Race race = getOrThrow(id);

        if (race.getStatus() == RaceStatus.COMPLETED || race.getStatus() == RaceStatus.IN_PROGRESS) {
            throw new BusinessRuleException("No se puede eliminar una carrera completada o en progreso");
        }

        raceRepository.delete(race);
    }

    private void validateDeadlineBeforeStart(java.time.LocalDateTime deadline, java.time.LocalDateTime scheduledAt) {
        if (deadline.isAfter(scheduledAt) || deadline.isEqual(scheduledAt)) {
            throw new BusinessRuleException("La fecha límite de inscripción debe ser anterior al inicio de la carrera");
        }
    }

    private Race getOrThrow(Long id) {
        return raceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carrera con ID " + id + " no fue encontrada"));
    }

    private RaceResponse toResponse(Race r) {
        return RaceResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .scheduledAt(r.getScheduledAt())
                .startLocation(r.getStartLocation())
                .finishLocation(r.getFinishLocation())
                .distanceMeters(r.getDistanceMeters())
                .maxParticipants(r.getMaxParticipants())
                .raceType(r.getRaceType())
                .status(r.getStatus())
                .organizer(r.getOrganizer())
                .registrationDeadline(r.getRegistrationDeadline())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}