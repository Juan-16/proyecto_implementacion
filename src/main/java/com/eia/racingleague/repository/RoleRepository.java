package com.eia.racingleague.repository;

import com.eia.racingleague.model.Role;
import com.eia.racingleague.model.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}