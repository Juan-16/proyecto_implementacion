package com.eia.racingleague.dto.team;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamRequest {

    @NotBlank(message = "El nombre del equipo es obligatorio")
    private String name;

    private String description;

    private String coachName;
}