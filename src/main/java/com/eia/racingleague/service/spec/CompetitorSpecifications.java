package com.eia.racingleague.service.spec;

import com.eia.racingleague.model.Competitor;
import com.eia.racingleague.model.CompetitorStatus;
import com.eia.racingleague.model.CompetitorType;
import org.springframework.data.jpa.domain.Specification;

public class CompetitorSpecifications {

    private CompetitorSpecifications() {
    }

    public static Specification<Competitor> hasType(CompetitorType type) {
        return (root, query, cb) -> type == null ? null : cb.equal(root.get("competitorType"), type);
    }

    public static Specification<Competitor> hasStatus(CompetitorStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Competitor> nameOrNicknameContains(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("nickname")), pattern)
            );
        };
    }
}