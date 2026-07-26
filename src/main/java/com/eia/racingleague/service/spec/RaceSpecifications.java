package com.eia.racingleague.service.spec;

import com.eia.racingleague.model.Race;
import com.eia.racingleague.model.RaceStatus;
import com.eia.racingleague.model.RaceType;
import org.springframework.data.jpa.domain.Specification;

public class RaceSpecifications {

    private RaceSpecifications() {
    }

    public static Specification<Race> hasType(RaceType type) {
        return (root, query, cb) -> type == null ? null : cb.equal(root.get("raceType"), type);
    }

    public static Specification<Race> hasStatus(RaceStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Race> nameContains(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            return cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%");
        };
    }
}