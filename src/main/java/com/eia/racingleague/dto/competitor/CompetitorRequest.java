package com.eia.racingleague.dto.competitor;

import com.eia.racingleague.model.CompetitorType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CompetitorRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotBlank(message = "El apodo es obligatorio")
    private String nickname;

    @NotNull(message = "El tipo de competidor es obligatorio")
    private CompetitorType competitorType;

    @Past(message = "La fecha de nacimiento debe estar en el pasado")
    private LocalDate dateOfBirth;

    @Positive(message = "La edad aproximada debe ser positiva")
    private Integer approximateAge;

    @NotNull(message = "El peso es obligatorio")
    @Positive(message = "El peso debe ser positivo")
    private Double weight;

    @NotNull(message = "La altura es obligatoria")
    @Positive(message = "La altura debe ser positiva")
    private Double height;

    private String countryOfOrigin;
}