package com.eia.racingleague.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefreshRequest {

    @NotBlank(message = "El refresh token es obligatorio")
    private String refreshToken;
}