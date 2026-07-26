package com.eia.racingleague.dto.team;

import com.eia.racingleague.model.TeamStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class TeamResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDate creationDate;
    private TeamStatus status;
    private String coachName;
    private Integer victories;
    private Integer defeats;
    private List<TeamMemberResponse> members;
}