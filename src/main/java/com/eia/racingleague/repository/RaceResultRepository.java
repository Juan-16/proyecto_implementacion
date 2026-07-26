package com.eia.racingleague.repository;

import com.eia.racingleague.model.RaceResult;
import com.eia.racingleague.model.ResultStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RaceResultRepository extends JpaRepository<RaceResult, Long> {

    @Query("""
        SELECT rr FROM RaceResult rr
        JOIN FETCH rr.registration reg
        LEFT JOIN FETCH reg.competitor
        LEFT JOIN FETCH reg.team
        WHERE rr.race.id = :raceId
    """)
    List<RaceResult> findByRaceId(Long raceId);


    @Query("""
        SELECT rr FROM RaceResult rr
        JOIN FETCH rr.registration reg
        LEFT JOIN FETCH reg.competitor
        LEFT JOIN FETCH reg.team
        WHERE rr.id = :id
    """)
    Optional<RaceResult> findByIdWithDetails(Long id);


    @Query("""
        SELECT rr
        FROM RaceResult rr
        JOIN FETCH rr.registration reg
        LEFT JOIN FETCH reg.competitor
        LEFT JOIN FETCH reg.team
    """)
    List<RaceResult> findAllWithRegistrationDetails();


    boolean existsByRegistrationId(Long registrationId);

    boolean existsByRaceIdAndFinalPositionAndStatus(Long raceId, Integer finalPosition, ResultStatus status);

    boolean existsByRaceIdAndFinalPositionAndStatusNot(Long raceId, Integer finalPosition, ResultStatus excludedStatus);

    int countByRaceId(Long raceId);
}