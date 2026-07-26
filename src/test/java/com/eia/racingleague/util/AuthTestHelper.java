package com.eia.racingleague.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class AuthTestHelper {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static String login(MockMvc mockMvc, String username, String password) throws Exception {
        String body = MAPPER.writeValueAsString(Map.of("username", username, "password", password));

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return MAPPER.readTree(response).get("accessToken").asText();
    }

    public static String loginAsAdmin(MockMvc mockMvc) throws Exception {
        return login(mockMvc, "admin", "Admin123!");
    }

    public static String loginAsOrganizer(MockMvc mockMvc) throws Exception {
        return login(mockMvc, "organizer", "Organizer123!");
    }

    public static String loginAsViewer(MockMvc mockMvc) throws Exception {
        return login(mockMvc, "viewer", "Viewer123!");
    }
}