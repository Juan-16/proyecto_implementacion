package com.eia.racingleague.dto.competitor;

import com.eia.racingleague.model.CompetitorStatus;
import com.eia.racingleague.model.CompetitorType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class CompetitorResponse {
    private Long id;
    private String name;
    private String nickname;
    private CompetitorType competitorType;
    private LocalDate dateOfBirth;
    private Integer approximateAge;
    private Double weight;
    private Double height;
    private String countryOfOrigin;
    private CompetitorStatus status;
    private LocalDate registrationDate;
    private Integer victories;
    private Integer defeats;
    private Integer racesCompleted;
}