package com.insureflow.controller;

import com.insureflow.dto.TrialCreationDTO;
import com.insureflow.model.InsurancePolicy;
import com.insureflow.service.PolicyUnderwritingService;
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
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
@Tag(name = "Policy Underwriting & Lifecycle Management", description = "Endpoints for policy provisioning, activation, and capacity tracking")
public class PolicyController {

    private final PolicyUnderwritingService policyService;

    @PostMapping
    @PreAuthorize("hasAnyRole('UNDERWRITER', 'INSURANCE_MANAGER')")
    @Operation(summary = "Provision a new insurance policy entry (TrialCreationDTO)")
    public ResponseEntity<InsurancePolicy> createPolicy(@Valid @RequestBody TrialCreationDTO dto) {
        InsurancePolicy created = policyService.createSeedPolicy(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('UNDERWRITER', 'INSURANCE_MANAGER', 'CLAIMS_ADJUSTER', 'POLICYHOLDER')")
    @Operation(summary = "Retrieve all insurance policies in core ledger")
    public ResponseEntity<List<InsurancePolicy>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @GetMapping("/my-policies")
    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'UNDERWRITER', 'INSURANCE_MANAGER', 'CLAIMS_ADJUSTER')")
    @Operation(summary = "Retrieve active policies held by authenticated claimant")
    public ResponseEntity<List<InsurancePolicy>> getMyPolicies(Authentication authentication) {
        return ResponseEntity.ok(policyService.getMyPoliciesByEmail(authentication.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('UNDERWRITER', 'INSURANCE_MANAGER', 'CLAIMS_ADJUSTER', 'POLICYHOLDER')")
    @Operation(summary = "Retrieve policy details by internal ID")
    public ResponseEntity<InsurancePolicy> getPolicyById(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.getPolicyById(id));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('UNDERWRITER', 'INSURANCE_MANAGER')")
    @Operation(summary = "Activate a pending policy following verified risk assessment")
    public ResponseEntity<InsurancePolicy> activatePolicy(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.activatePolicy(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSURANCE_MANAGER', 'UNDERWRITER')")
    @Operation(summary = "Delete / purge an insurance policy")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
