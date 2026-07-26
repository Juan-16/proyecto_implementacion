package com.eia.racingleague.dto.team;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TeamMemberResponse {
    private Long competitorId;
    private String competitorName;
    private String competitorNickname;
}