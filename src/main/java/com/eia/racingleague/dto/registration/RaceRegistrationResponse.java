package com.eia.racingleague.dto.registration;

import com.eia.racingleague.model.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class RaceRegistrationResponse {
    private Long id;
    private Long raceId;
    private String raceName;
    private Long competitorId;
    private String competitorName;
    private Long teamId;
    private String teamName;
    private LocalDateTime registeredAt;
    private RegistrationStatus status;
    private Integer startingPosition;
    private String validationNotes;
    private String rejectionReason;
    private String registeredBy;
}