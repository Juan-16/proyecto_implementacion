package com.eia.racingleague.dto.standing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CompetitorStandingResponse {
    private Long competitorId;
    private String name;
    private String nickname;
    private Integer victories;
    private Integer defeats;
    private Integer racesCompleted;
    private Integer totalPoints;
}