package com.insureflow.controller;

import com.insureflow.dto.AuthRequestDTO;
import com.insureflow.dto.AuthResponseDTO;
import com.insureflow.dto.RegisterRequestDTO;
import com.insureflow.dto.UserProfileDTO;
import com.insureflow.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Identity Management", description = "Endpoints for user registration, JWT login, and profile introspection")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account with specific role")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        return new ResponseEntity<>(authService.register(dto), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials and issue HS256 JWT token")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @GetMapping("/me")
    @Operation(summary = "Fetch current authenticated user profile")
    public ResponseEntity<UserProfileDTO> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUserProfile());
    }
}
