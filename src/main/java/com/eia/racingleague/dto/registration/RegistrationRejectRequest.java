package com.eia.racingleague.dto.registration;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistrationRejectRequest {

    @NotBlank(message = "Se debe indicar una razón de rechazo")
    private String reason;
}