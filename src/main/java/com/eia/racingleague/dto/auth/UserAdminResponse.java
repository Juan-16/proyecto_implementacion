package com.eia.racingleague.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.Set;

@Getter
@Builder
@AllArgsConstructor
public class UserAdminResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private boolean enabled;
    private Set<String> roles;
}