package com.eia.racingleague.service;

import com.eia.racingleague.dto.competitor.CompetitorRequest;
import com.eia.racingleague.dto.competitor.CompetitorResponse;
import com.eia.racingleague.dto.competitor.CompetitorStatusUpdateRequest;
import com.eia.racingleague.exception.BusinessRuleException;
import com.eia.racingleague.exception.DuplicateResourceException;
import com.eia.racingleague.exception.ResourceNotFoundException;
import com.eia.racingleague.model.Competitor;
import com.eia.racingleague.model.CompetitorStatus;
import com.eia.racingleague.model.CompetitorType;
import com.eia.racingleague.repository.CompetitorRepository;
import com.eia.racingleague.service.spec.CompetitorSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompetitorService {

    private final CompetitorRepository competitorRepository;
    private final AuditService auditService;

    @Transactional
    public CompetitorResponse create(CompetitorRequest request) {
        if (competitorRepository.existsByNickname(request.getNickname())) {
            throw new DuplicateResourceException("El apodo '" + request.getNickname() + "' ya está en uso");
        }

        Competitor competitor = Competitor.builder()
                .name(request.getName())
                .nickname(request.getNickname())
                .competitorType(request.getCompetitorType())
                .dateOfBirth(request.getDateOfBirth())
                .approximateAge(request.getApproximateAge())
                .weight(request.getWeight())
                .height(request.getHeight())
                .countryOfOrigin(request.getCountryOfOrigin())
                .status(CompetitorStatus.ACTIVE)
                .build();

        Competitor saved = competitorRepository.save(competitor);
        auditService.log("COMPETITOR_CREATED", "Competitor", saved.getId().toString(),
                "Competidor creado: " + saved.getNickname());
        return toResponse(saved);
    }

    public Page<CompetitorResponse> findAll(CompetitorType type, CompetitorStatus status,
                                            String search, Pageable pageable) {
        Specification<Competitor> spec = Specification.where(CompetitorSpecifications.hasType(type))
                .and(CompetitorSpecifications.hasStatus(status))
                .and(CompetitorSpecifications.nameOrNicknameContains(search));

        return competitorRepository.findAll(spec, pageable).map(this::toResponse);
    }

    public CompetitorResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public CompetitorResponse update(Long id, CompetitorRequest request) {
        Competitor competitor = getOrThrow(id);

        if (competitorRepository.existsByNicknameAndIdNot(request.getNickname(), id)) {
            throw new DuplicateResourceException("El apodo '" + request.getNickname() + "' ya está en uso");
        }

        // Regla: el tipo de competidor NO se puede cambiar una vez creado
        // (un camello no puede convertirse en enano, por más que insista).
        if (competitor.getCompetitorType() != request.getCompetitorType()) {
            throw new BusinessRuleException("El tipo de competidor no puede modificarse una vez creado");
        }

        competitor.setName(request.getName());
        competitor.setNickname(request.getNickname());
        competitor.setDateOfBirth(request.getDateOfBirth());
        competitor.setApproximateAge(request.getApproximateAge());
        competitor.setWeight(request.getWeight());
        competitor.setHeight(request.getHeight());
        competitor.setCountryOfOrigin(request.getCountryOfOrigin());

        return toResponse(competitorRepository.save(competitor));
    }

    @Transactional
    public CompetitorResponse updateStatus(Long id, CompetitorStatusUpdateRequest request) {
        Competitor competitor = getOrThrow(id);
        String previousStatus = competitor.getStatus().name();
        competitor.setStatus(request.getStatus());
        Competitor updated = competitorRepository.save(competitor);
        auditService.log("COMPETITOR_STATUS_CHANGED", "Competitor", id.toString(),
                "Cambio de estado de competidor", previousStatus, request.getStatus().name());
        return toResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        Competitor competitor = getOrThrow(id);

        if (competitor.getRacesCompleted() != null && competitor.getRacesCompleted() > 0) {
            // Tiene resultados oficiales: no se borra físicamente, se retira.
            competitor.setStatus(CompetitorStatus.RETIRED);
            competitorRepository.save(competitor);
            auditService.log("COMPETITOR_RETIRED", "Competitor", id.toString(),
                    "Competidor retirado en vez de eliminado (tiene carreras oficiales)");
            return;
        }

        competitorRepository.delete(competitor);
        auditService.log("COMPETITOR_DELETED", "Competitor", id.toString(), "Competidor eliminado físicamente");
    }

    private Competitor getOrThrow(Long id) {
        return competitorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Competidor con ID " + id + " no fue encontrado"));
    }

    private CompetitorResponse toResponse(Competitor c) {
        return CompetitorResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .nickname(c.getNickname())
                .competitorType(c.getCompetitorType())
                .dateOfBirth(c.getDateOfBirth())
                .approximateAge(c.getApproximateAge())
                .weight(c.getWeight())
                .height(c.getHeight())
                .countryOfOrigin(c.getCountryOfOrigin())
                .status(c.getStatus())
                .registrationDate(c.getRegistrationDate())
                .victories(c.getVictories())
                .defeats(c.getDefeats())
                .racesCompleted(c.getRacesCompleted())
                .build();
    }
}