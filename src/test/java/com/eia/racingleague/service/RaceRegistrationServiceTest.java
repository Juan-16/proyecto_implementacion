package com.eia.racingleague.service;

import com.eia.racingleague.dto.registration.RaceRegistrationRequest;
import com.eia.racingleague.exception.BusinessRuleException;
import com.eia.racingleague.model.*;
import com.eia.racingleague.repository.CompetitorRepository;
import com.eia.racingleague.repository.RaceRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RaceRegistrationServiceTest {

    @Autowired
    private RaceRegistrationService registrationService;

    @Autowired
    private CompetitorRepository competitorRepository;

    @Autowired
    private RaceRepository raceRepository;

    private Competitor createCompetitor(String nickname, CompetitorStatus status) {
        Competitor competitor = Competitor.builder()
                .name("Test Competitor " + nickname)
                .nickname(nickname)
                .competitorType(CompetitorType.MEDIUM)
                .weight(70.0)
                .height(1.70)
                .status(status)
                .build();
        return competitorRepository.save(competitor);
    }

    private Race createRace(RaceStatus status, LocalDateTime deadline, RaceType type) {
        Race race = Race.builder()
                .name("Test Race " + System.nanoTime())
                .scheduledAt(LocalDateTime.now().plusDays(5))
                .distanceMeters(1000.0)
                .maxParticipants(5)
                .raceType(type)
                .registrationDeadline(deadline)
                .status(status)
                .build();
        return raceRepository.save(race);
    }

    // Test 6: Register an active competitor successfully
    @Test
    void registerActiveCompetitor_succeeds() {
        Competitor competitor = createCompetitor("active_" + System.nanoTime(), CompetitorStatus.ACTIVE);
        Race race = createRace(RaceStatus.OPEN_FOR_REGISTRATION, LocalDateTime.now().plusDays(2), RaceType.INDIVIDUAL);

        RaceRegistrationRequest request = new RaceRegistrationRequest();
        request.setCompetitorId(competitor.getId());

        var response = registrationService.register(race.getId(), request, "organizer");

        assertEquals(RegistrationStatus.PENDING, response.getStatus());
        assertEquals(competitor.getId(), response.getCompetitorId());
    }

    // Test 7: Reject a suspended competitor
    @Test
    void registerSuspendedCompetitor_throwsBusinessRuleException() {
        Competitor competitor = createCompetitor("suspended_" + System.nanoTime(), CompetitorStatus.SUSPENDED);
        Race race = createRace(RaceStatus.OPEN_FOR_REGISTRATION, LocalDateTime.now().plusDays(2), RaceType.INDIVIDUAL);

        RaceRegistrationRequest request = new RaceRegistrationRequest();
        request.setCompetitorId(competitor.getId());

        assertThrows(BusinessRuleException.class,
                () -> registrationService.register(race.getId(), request, "organizer"));
    }

    // Test 8: Reject a duplicated registration
    @Test
    void duplicatedRegistration_throwsBusinessRuleException() {
        Competitor competitor = createCompetitor("dup_" + System.nanoTime(), CompetitorStatus.ACTIVE);
        Race race = createRace(RaceStatus.OPEN_FOR_REGISTRATION, LocalDateTime.now().plusDays(2), RaceType.INDIVIDUAL);

        RaceRegistrationRequest request = new RaceRegistrationRequest();
        request.setCompetitorId(competitor.getId());
        registrationService.register(race.getId(), request, "organizer");

        RaceRegistrationRequest secondAttempt = new RaceRegistrationRequest();
        secondAttempt.setCompetitorId(competitor.getId());

        assertThrows(BusinessRuleException.class,
                () -> registrationService.register(race.getId(), secondAttempt, "organizer"));
    }

    // Test 9: Reject registration after the deadline
    @Test
    void registrationAfterDeadline_throwsBusinessRuleException() {
        Competitor competitor = createCompetitor("late_" + System.nanoTime(), CompetitorStatus.ACTIVE);
        Race race = createRace(RaceStatus.OPEN_FOR_REGISTRATION, LocalDateTime.now().minusHours(1), RaceType.INDIVIDUAL);

        RaceRegistrationRequest request = new RaceRegistrationRequest();
        request.setCompetitorId(competitor.getId());

        assertThrows(BusinessRuleException.class,
                () -> registrationService.register(race.getId(), request, "organizer"));
    }
}