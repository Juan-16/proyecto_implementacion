package com.eia.racingleague.dto.standing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TeamStandingResponse {
    private Long teamId;
    private String name;
    private Integer victories;
    private Integer defeats;
    private Integer totalPoints;
}