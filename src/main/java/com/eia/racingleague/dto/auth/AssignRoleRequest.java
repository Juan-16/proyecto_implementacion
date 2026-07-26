package com.eia.racingleague.dto.auth;

import com.eia.racingleague.model.RoleName;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignRoleRequest {

    @NotNull(message = "El rol es obligatorio")
    private RoleName roleName;
}