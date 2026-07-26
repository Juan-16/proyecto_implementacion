package com.eia.racingleague.controller;

import com.eia.racingleague.dto.race.RaceRequest;
import com.eia.racingleague.model.RaceType;
import com.eia.racingleague.util.AuthTestHelper;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RaceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private RaceRequest buildValidRaceRequest(String name) {
        RaceRequest request = new RaceRequest();
        request.setName(name);
        request.setScheduledAt(LocalDateTime.now().plusDays(20));
        request.setDistanceMeters(1000.0);
        request.setMaxParticipants(5);
        request.setRaceType(RaceType.INDIVIDUAL);
        request.setRegistrationDeadline(LocalDateTime.now().plusDays(18));
        return request;
    }

    // Test 4 y 13: Create a valid race / Allow an administrator to create a race
    @Test
    void adminCanCreateValidRace_returnsCreated() throws Exception {
        String adminToken = AuthTestHelper.loginAsAdmin(mockMvc);
        RaceRequest request = buildValidRaceRequest("Test Race Admin " + System.nanoTime());

        mockMvc.perform(post("/api/races")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    // Test 5: Reject a race scheduled in the past
    @Test
    void raceScheduledInPast_returnsBadRequest() throws Exception {
        String adminToken = AuthTestHelper.loginAsAdmin(mockMvc);

        RaceRequest request = buildValidRaceRequest("Ghost Race");
        request.setScheduledAt(LocalDateTime.now().minusDays(5));
        request.setRegistrationDeadline(LocalDateTime.now().minusDays(7));

        mockMvc.perform(post("/api/races")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.scheduledAt").exists());
    }

    // Test 12: Prevent a viewer from creating a race
    @Test
    void viewerCannotCreateRace_returnsForbidden() throws Exception {
        String viewerToken = AuthTestHelper.loginAsViewer(mockMvc);
        RaceRequest request = buildValidRaceRequest("Viewer Race Attempt");

        mockMvc.perform(post("/api/races")
                        .header("Authorization", "Bearer " + viewerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    // Test 14: Return 401 without a valid token
    @Test
    void noTokenProvided_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/competitors"))
                .andExpect(status().isUnauthorized());
    }

    // Test 15: Return 404 for a missing resource
    @Test
    void missingRace_returnsNotFound() throws Exception {
        String adminToken = AuthTestHelper.loginAsAdmin(mockMvc);

        mockMvc.perform(get("/api/races/999999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}