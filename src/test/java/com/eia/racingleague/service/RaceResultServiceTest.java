package com.eia.racingleague.service;

import com.eia.racingleague.dto.result.RaceResultRequest;
import com.eia.racingleague.exception.BusinessRuleException;
import com.eia.racingleague.model.*;
import com.eia.racingleague.repository.CompetitorRepository;
import com.eia.racingleague.repository.RaceRegistrationRepository;
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
class RaceResultServiceTest {

    @Autowired
    private RaceResultService raceResultService;

    @Autowired
    private CompetitorRepository competitorRepository;

    @Autowired
    private RaceRepository raceRepository;

    @Autowired
    private RaceRegistrationRepository registrationRepository;

    private Competitor createCompetitor(String nickname) {
        Competitor competitor = Competitor.builder()
                .name("Result Competitor " + nickname)
                .nickname(nickname)
                .competitorType(CompetitorType.MEDIUM)
                .weight(70.0)
                .height(1.70)
                .status(CompetitorStatus.ACTIVE)
                .build();
        return competitorRepository.save(competitor);
    }

    private Race createInProgressRace() {
        Race race = Race.builder()
                .name("In Progress Race " + System.nanoTime())
                .scheduledAt(LocalDateTime.now().minusHours(1))
                .distanceMeters(1000.0)
                .maxParticipants(5)
                .raceType(RaceType.INDIVIDUAL)
                .registrationDeadline(LocalDateTime.now().minusHours(2))
                .status(RaceStatus.IN_PROGRESS)
                .build();
        return raceRepository.save(race);
    }

    private RaceRegistration createApprovedRegistration(Race race, Competitor competitor, int position) {
        RaceRegistration registration = RaceRegistration.builder()
                .race(race)
                .competitor(competitor)
                .status(RegistrationStatus.APPROVED)
                .startingPosition(position)
                .build();
        return registrationRepository.save(registration);
    }

    // Test 10: Record a valid result
    @Test
    void recordValidResult_succeeds() {
        Race race = createInProgressRace();
        Competitor competitor = createCompetitor("winner_" + System.nanoTime());
        RaceRegistration registration = createApprovedRegistration(race, competitor, 1);

        RaceResultRequest request = new RaceResultRequest();
        request.setRegistrationId(registration.getId());
        request.setFinalPosition(1);
        request.setCompletionTimeSeconds(120.0);
        request.setStatus(ResultStatus.FINISHED);

        var response = raceResultService.create(race.getId(), request, "organizer");

        assertEquals(1, response.getFinalPosition());
        assertEquals(10, response.getPoints());
    }

    // Test 11: Reject two winners in one race
    @Test
    void twoWinnersInSameRace_throwsBusinessRuleException() {
        Race race = createInProgressRace();

        Competitor first = createCompetitor("first_" + System.nanoTime());
        Competitor second = createCompetitor("second_" + System.nanoTime());

        RaceRegistration firstRegistration = createApprovedRegistration(race, first, 1);
        RaceRegistration secondRegistration = createApprovedRegistration(race, second, 2);

        RaceResultRequest firstResult = new RaceResultRequest();
        firstResult.setRegistrationId(firstRegistration.getId());
        firstResult.setFinalPosition(1);
        firstResult.setCompletionTimeSeconds(100.0);
        firstResult.setStatus(ResultStatus.FINISHED);
        raceResultService.create(race.getId(), firstResult, "organizer");

        RaceResultRequest secondResultAlsoWinner = new RaceResultRequest();
        secondResultAlsoWinner.setRegistrationId(secondRegistration.getId());
        secondResultAlsoWinner.setFinalPosition(1);
        secondResultAlsoWinner.setCompletionTimeSeconds(95.0);
        secondResultAlsoWinner.setStatus(ResultStatus.FINISHED);

        assertThrows(BusinessRuleException.class,
                () -> raceResultService.create(race.getId(), secondResultAlsoWinner, "organizer"));
    }
}