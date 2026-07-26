package com.eia.racingleague.dto.registration;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RaceRegistrationRequest {

    // Exactamente uno de los dos debe venir informado; se valida en el servicio.
    private Long competitorId;

    private Long teamId;

    private String validationNotes;
}