package com.eia.racingleague.dto.result;

import com.eia.racingleague.model.ResultStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class RaceResultResponse {
    private Long id;
    private Long raceId;
    private Long registrationId;
    private String participantName; // nombre de competidor o de equipo
    private Integer startingPosition;
    private Integer finalPosition;
    private Double completionTimeSeconds;
    private Double penaltyTimeSeconds;
    private ResultStatus status;
    private String notes;
    private String recordedBy;
    private LocalDateTime recordedAt;
    private Integer points;
}