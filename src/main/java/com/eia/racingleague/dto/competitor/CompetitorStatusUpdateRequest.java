package com.eia.racingleague.dto.competitor;

import com.eia.racingleague.model.CompetitorStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompetitorStatusUpdateRequest {

    @NotNull(message = "El nuevo estado es obligatorio")
    private CompetitorStatus status;
}