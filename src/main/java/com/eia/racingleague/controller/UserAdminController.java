package com.eia.racingleague.controller;

import com.eia.racingleague.dto.auth.AssignRoleRequest;
import com.eia.racingleague.dto.auth.UserAdminResponse;
import com.eia.racingleague.exception.ResourceNotFoundException;
import com.eia.racingleague.model.Role;
import com.eia.racingleague.model.User;
import com.eia.racingleague.repository.RoleRepository;
import com.eia.racingleague.repository.UserRepository;
import com.eia.racingleague.service.AuditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<List<UserAdminResponse>> findAll() {
        List<UserAdminResponse> users = userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<UserAdminResponse> findById(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario con ID " + userId + " no fue encontrado"));
        return ResponseEntity.ok(toResponse(user));
    }

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<UserAdminResponse> assignRole(
            @PathVariable Long userId,
            @Valid @RequestBody AssignRoleRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario con ID " + userId + " no fue encontrado"));

        Role role = roleRepository.findByName(request.getRoleName())
                .orElseThrow(() -> new ResourceNotFoundException("Rol " + request.getRoleName() + " no está configurado"));

        String previousRoles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.joining(", "));

        user.setRoles(Set.of(role));
        User saved = userRepository.save(user);

        auditService.log("USER_ROLE_ASSIGNED", "User", userId.toString(),
                "Rol reasignado al usuario " + user.getUsername(),
                previousRoles, role.getName().name());

        return ResponseEntity.ok(toResponse(saved));
    }

    private UserAdminResponse toResponse(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet());

        return UserAdminResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .enabled(user.isEnabled())
                .roles(roles)
                .build();
    }
}