package com.insureflow.service;

import com.insureflow.dto.AuthRequestDTO;
import com.insureflow.dto.AuthResponseDTO;
import com.insureflow.dto.RegisterRequestDTO;
import com.insureflow.dto.UserProfileDTO;
import com.insureflow.exception.BusinessValidationException;
import com.insureflow.exception.ResourceNotFoundException;
import com.insureflow.model.SystemAccount;
import com.insureflow.repository.SystemAccountRepository;
import com.insureflow.security.JwtUtil;
import com.insureflow.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SystemAccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO dto) {
        if (accountRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessValidationException("An account with email " + dto.getEmail() + " already exists.");
        }

        SystemAccount account = SystemAccount.builder()
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .fullName(dto.getFullName())
                .role(dto.getRole())
                .isActive(true)
                .build();

        SystemAccount saved = accountRepository.save(account);
        UserPrincipal principal = new UserPrincipal(saved);
        String token = jwtUtil.generateToken(principal, saved.getRole().name(), saved.getId(), saved.getFullName());

        return AuthResponseDTO.builder()
                .token(token)
                .type("Bearer")
                .id(saved.getId())
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .role(saved.getRole().name())
                .build();
    }

    public AuthResponseDTO login(AuthRequestDTO dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        SystemAccount account = principal.getAccount();
        String token = jwtUtil.generateToken(principal, account.getRole().name(), account.getId(), account.getFullName());

        return AuthResponseDTO.builder()
                .token(token)
                .type("Bearer")
                .id(account.getId())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .role(account.getRole().name())
                .build();
    }

    public UserProfileDTO getCurrentUserProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResourceNotFoundException("No authenticated user found in security context");
        }
        String email = auth.getName();
        SystemAccount account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for email: " + email));

        return UserProfileDTO.builder()
                .id(account.getId())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .role(account.getRole())
                .isActive(account.getIsActive())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
