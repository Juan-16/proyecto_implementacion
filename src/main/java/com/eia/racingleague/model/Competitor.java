package com.eia.racingleague.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "competitors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Competitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 60)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(name = "competitor_type", nullable = false, length = 20)
    private CompetitorType competitorType;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "approximate_age")
    private Integer approximateAge;

    @Column(nullable = false)
    private Double weight;

    @Column(nullable = false)
    private Double height;

    @Column(name = "country_of_origin", length = 100)
    private String countryOfOrigin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CompetitorStatus status;

    @Column(name = "registration_date", nullable = false, updatable = false)
    private LocalDate registrationDate;

    @Builder.Default
    private Integer victories = 0;

    @Builder.Default
    private Integer defeats = 0;

    @Column(name = "races_completed")
    @Builder.Default
    private Integer racesCompleted = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.registrationDate = LocalDate.now();
        if (this.status == null) {
            this.status = CompetitorStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}