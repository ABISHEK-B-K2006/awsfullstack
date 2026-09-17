package com.insureflow.controller;

import com.insureflow.dto.ClaimReviewDTO;
import com.insureflow.dto.EnrollmentRequestDTO;
import com.insureflow.dto.ObservationDTO;
import com.insureflow.model.ClaimSubmission;
import com.insureflow.service.ClaimProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
@Tag(name = "Claim Submission & Adjudication Pipeline", description = "Endpoints for loss notice intake, adjuster review, and pessimistic-lock adjudication")
public class ClaimController {

    private final ClaimProcessingService claimService;

    @PostMapping
    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'UNDERWRITER', 'INSURANCE_MANAGER', 'CLAIMS_ADJUSTER')")
    @Operation(summary = "File a new insurance loss claim notice (EnrollmentRequestDTO)")
    public ResponseEntity<ClaimSubmission> submitClaim(@Valid @RequestBody EnrollmentRequestDTO dto, Authentication authentication) {
        ClaimSubmission created = claimService.submitClaim(dto, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CLAIMS_ADJUSTER', 'INSURANCE_MANAGER', 'UNDERWRITER', 'POLICYHOLDER')")
    @Operation(summary = "Retrieve all submitted loss claims in review backlog")
    public ResponseEntity<List<ClaimSubmission>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    @GetMapping("/my-claims")
    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'CLAIMS_ADJUSTER', 'INSURANCE_MANAGER', 'UNDERWRITER')")
    @Operation(summary = "Retrieve claims filed by authenticated policyholder")
    public ResponseEntity<List<ClaimSubmission>> getMyClaims(Authentication authentication) {
        return ResponseEntity.ok(claimService.getMyClaims(authentication.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'CLAIMS_ADJUSTER', 'INSURANCE_MANAGER', 'UNDERWRITER')")
    @Operation(summary = "Retrieve claim details by ID")
    public ResponseEntity<ClaimSubmission> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getClaimById(id));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('CLAIMS_ADJUSTER', 'INSURANCE_MANAGER')")
    @Operation(summary = "Submit adjuster review notes & recommendation for a claim")
    public ResponseEntity<ClaimSubmission> reviewClaim(@PathVariable Long id, @Valid @RequestBody ClaimReviewDTO dto) {
        return ResponseEntity.ok(claimService.reviewClaim(id, dto));
    }

    @PatchMapping("/{id}/adjudicate")
    @PreAuthorize("hasRole('INSURANCE_MANAGER')")
    @Operation(summary = "Adjudicate claim (APPROVED/REJECTED) with transactional Pessimistic Write Lock")
    public ResponseEntity<ClaimSubmission> adjudicateClaim(@PathVariable Long id, @Valid @RequestBody ObservationDTO dto) {
        return ResponseEntity.ok(claimService.adjudicateClaim(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'INSURANCE_MANAGER')")
    @Operation(summary = "Delete or withdraw an unadjudicated claim notice")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        claimService.deleteClaim(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
