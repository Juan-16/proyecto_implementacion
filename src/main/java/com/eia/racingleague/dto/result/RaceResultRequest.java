package com.eia.racingleague.dto.result;

import com.eia.racingleague.model.ResultStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RaceResultRequest {

    @NotNull(message = "La inscripción es obligatoria")
    private Long registrationId;

    private Integer finalPosition;

    @Positive(message = "El tiempo de finalización debe ser positivo")
    private Double completionTimeSeconds;

    @PositiveOrZero(message = "El tiempo de penalización no puede ser negativo")
    private Double penaltyTimeSeconds;

    @NotNull(message = "El estado del resultado es obligatorio")
    private ResultStatus status;

    private String notes;
}