package com.eia.racingleague.dto.race;

import com.eia.racingleague.model.RaceStatus;
import com.eia.racingleague.model.RaceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class RaceResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime scheduledAt;
    private String startLocation;
    private String finishLocation;
    private Double distanceMeters;
    private Integer maxParticipants;
    private RaceType raceType;
    private RaceStatus status;
    private String organizer;
    private LocalDateTime registrationDeadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}