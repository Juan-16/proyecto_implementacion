package com.eia.racingleague.dto.registration;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistrationApproveRequest {

    // Opcional: si no se envía, el sistema asigna automáticamente
    // la siguiente posición de salida disponible.
    private Integer startingPosition;
}