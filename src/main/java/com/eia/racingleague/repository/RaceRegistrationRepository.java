package com.eia.racingleague.repository;

import com.eia.racingleague.model.RaceRegistration;
import com.eia.racingleague.model.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RaceRegistrationRepository extends JpaRepository<RaceRegistration, Long> {

    @Query("""
    SELECT rr FROM RaceRegistration rr
    LEFT JOIN FETCH rr.competitor
    LEFT JOIN FETCH rr.team
    LEFT JOIN FETCH rr.race
    WHERE rr.race.id = :raceId
""")
    Page<RaceRegistration> findByRaceId(Long raceId, Pageable pageable);

    @Query("""
        SELECT rr FROM RaceRegistration rr
        LEFT JOIN FETCH rr.competitor
        LEFT JOIN FETCH rr.team
        LEFT JOIN FETCH rr.race
        WHERE rr.id = :id
    """)
    Optional<RaceRegistration> findByIdWithDetails(Long id);

    @Query("""
        SELECT rr FROM RaceRegistration rr
        WHERE rr.race.id = :raceId AND rr.status IN :statuses
    """)
    List<RaceRegistration> findActiveByRaceId(Long raceId, List<RegistrationStatus> statuses);

    @Query("""
    SELECT rr
    FROM RaceRegistration rr
    JOIN FETCH rr.race
    LEFT JOIN FETCH rr.competitor
    LEFT JOIN FETCH rr.team
    WHERE rr.status = 'APPROVED'
""")
    List<RaceRegistration> findAllWithRace();

    @Query("""
    SELECT rr 
    FROM RaceRegistration rr
    JOIN FETCH rr.race
    JOIN FETCH rr.competitor
    WHERE rr.status = 'APPROVED'
""")
    List<RaceRegistration> findAllWithRaceAndCompetitor();

    boolean existsByRaceIdAndCompetitorIdAndStatusIn(Long raceId, Long competitorId, List<RegistrationStatus> statuses);

    boolean existsByRaceIdAndTeamIdAndStatusIn(Long raceId, Long teamId, List<RegistrationStatus> statuses);

    int countByRaceIdAndStatus(Long raceId, RegistrationStatus status);

    boolean existsByRaceIdAndStartingPositionAndStatus(Long raceId, Integer startingPosition, RegistrationStatus status);
}