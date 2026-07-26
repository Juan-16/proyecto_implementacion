package com.eia.racingleague.repository;

import com.eia.racingleague.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    @Query("""
        SELECT tm 
        FROM TeamMember tm
        JOIN FETCH tm.competitor
        WHERE tm.team.id = :teamId
        AND tm.active = true
    """)
    List<TeamMember> findActiveMembersWithCompetitor(Long teamId);


    int countByTeamIdAndActiveTrue(Long teamId);


    Optional<TeamMember> findByTeamIdAndCompetitorIdAndActiveTrue(Long teamId, Long competitorId);


    Optional<TeamMember> findByCompetitorIdAndActiveTrue(Long competitorId);


    boolean existsByTeamIdAndCompetitorIdAndActiveTrue(Long teamId, Long competitorId);
}