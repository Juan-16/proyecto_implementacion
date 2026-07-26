package com.eia.racingleague.dto.race;

import com.eia.racingleague.model.RaceType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class RaceRequest {

    @NotBlank(message = "El nombre de la carrera es obligatorio")
    private String name;

    private String description;

    @NotNull(message = "La fecha y hora programada es obligatoria")
    @Future(message = "La carrera no puede programarse en el pasado")
    private LocalDateTime scheduledAt;

    private String startLocation;

    private String finishLocation;

    @NotNull(message = "La distancia es obligatoria")
    @Positive(message = "La distancia debe ser mayor que cero")
    private Double distanceMeters;

    @NotNull(message = "El número máximo de participantes es obligatorio")
    @Positive(message = "El número máximo de participantes debe ser positivo")
    private Integer maxParticipants;

    @NotNull(message = "El tipo de carrera es obligatorio")
    private RaceType raceType;

    private String organizer;

    @NotNull(message = "La fecha límite de inscripción es obligatoria")
    private LocalDateTime registrationDeadline;
}