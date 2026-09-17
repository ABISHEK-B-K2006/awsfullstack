package com.insureflow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insureflow.dto.AuthRequestDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Test Case 5.4.1: Authentication Success - Valid Credentials")
    void testValidLogin() throws Exception {
        AuthRequestDTO request = AuthRequestDTO.builder()
                .email("holder@insureflow.com")
                .password("Password123!")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("holder@insureflow.com"))
                .andExpect(jsonPath("$.role").value("ROLE_POLICYHOLDER"));
    }

    @Test
    @DisplayName("Test Case 5.4.1: Authentication Failure Handling - Invalid Password")
    void testInvalidPasswordLogin() throws Exception {
        AuthRequestDTO request = AuthRequestDTO.builder()
                .email("underwriter@insureflow.com")
                .password("wrongPass123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid email or password / Bad credentials"));
    }
}
