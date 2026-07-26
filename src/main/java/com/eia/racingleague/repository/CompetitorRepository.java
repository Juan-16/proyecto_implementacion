package com.eia.racingleague.repository;

import com.eia.racingleague.model.Competitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface CompetitorRepository extends JpaRepository<Competitor, Long>,
        JpaSpecificationExecutor<Competitor> {

    boolean existsByNickname(String nickname);

    boolean existsByNicknameAndIdNot(String nickname, Long id);

    Optional<Competitor> findByNickname(String nickname);
}