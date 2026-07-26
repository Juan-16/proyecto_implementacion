package com.eia.racingleague.repository;

import com.eia.racingleague.model.Race;
import com.eia.racingleague.model.RaceStatus;
import com.eia.racingleague.model.RaceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RaceRepository extends JpaRepository<Race, Long>, JpaSpecificationExecutor<Race> {
}