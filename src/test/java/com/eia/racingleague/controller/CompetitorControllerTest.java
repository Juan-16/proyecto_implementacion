package com.eia.racingleague.controller;

import com.eia.racingleague.dto.competitor.CompetitorRequest;
import com.eia.racingleague.model.CompetitorType;
import com.eia.racingleague.util.AuthTestHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CompetitorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Test 1: Create a valid competitor
    @Test
    void createValidCompetitor_returnsCreated() throws Exception {
        String adminToken = AuthTestHelper.loginAsAdmin(mockMvc);

        CompetitorRequest request = new CompetitorRequest();
        request.setName("Frodo Swiftfoot");
        request.setNickname("frodo_test_" + System.nanoTime());
        request.setCompetitorType(CompetitorType.DWARF);
        request.setWeight(60.0);
        request.setHeight(1.20);

        mockMvc.perform(post("/api/competitors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nickname").value(request.getNickname()))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    // Test 2: Reject a competitor with invalid weight
    @Test
    void createCompetitorWithInvalidWeight_returnsBadRequest() throws Exception {
        String adminToken = AuthTestHelper.loginAsAdmin(mockMvc);

        CompetitorRequest request = new CompetitorRequest();
        request.setName("Negative Nelly");
        request.setNickname("neg_weight_" + System.nanoTime());
        request.setCompetitorType(CompetitorType.MEDIUM);
        request.setWeight(-10.0);
        request.setHeight(1.70);

        mockMvc.perform(post("/api/competitors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.weight").exists());
    }

    // Test 3: Reject a duplicated nickname
    @Test
    void createCompetitorWithDuplicatedNickname_returnsConflict() throws Exception {
        String adminToken = AuthTestHelper.loginAsAdmin(mockMvc);
        String nickname = "duplicate_test_" + System.nanoTime();

        CompetitorRequest first = new CompetitorRequest();
        first.setName("Original Competitor");
        first.setNickname(nickname);
        first.setCompetitorType(CompetitorType.CAMEL);
        first.setWeight(500.0);
        first.setHeight(1.80);

        mockMvc.perform(post("/api/competitors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isCreated());

        CompetitorRequest duplicate = new CompetitorRequest();
        duplicate.setName("Copycat Competitor");
        duplicate.setNickname(nickname);
        duplicate.setCompetitorType(CompetitorType.CAMEL);
        duplicate.setWeight(510.0);
        duplicate.setHeight(1.82);

        mockMvc.perform(post("/api/competitors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict());
    }
}