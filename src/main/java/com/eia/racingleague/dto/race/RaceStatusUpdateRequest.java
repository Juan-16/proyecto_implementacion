package com.eia.racingleague.dto.race;

import com.eia.racingleague.model.RaceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RaceStatusUpdateRequest {

    @NotNull(message = "El nuevo estado es obligatorio")
    private RaceStatus status;
}