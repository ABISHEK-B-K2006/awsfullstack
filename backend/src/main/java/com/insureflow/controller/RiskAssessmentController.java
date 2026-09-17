package com.insureflow.controller;

import com.insureflow.dto.AdverseEventDTO;
import com.insureflow.dto.RiskCalculationRequestDTO;
import com.insureflow.dto.RiskCalculationResponseDTO;
import com.insureflow.model.RiskAssessment;
import com.insureflow.service.RiskAssessmentService;
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
@RequestMapping("/api/v1/assessments")
@RequiredArgsConstructor
@Tag(name = "Risk Assessment & Actuarial Scoring Engine", description = "Endpoints for actuarial risk calculations, risk tier mapping, and audit notes")
public class RiskAssessmentController {

    private final RiskAssessmentService riskAssessmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('UNDERWRITER', 'INSURANCE_MANAGER')")
    @Operation(summary = "Persist an actuarial risk evaluation for a policy (AdverseEventDTO)")
    public ResponseEntity<RiskAssessment> createAssessment(@Valid @RequestBody AdverseEventDTO dto, Authentication authentication) {
        RiskAssessment created = riskAssessmentService.createRiskAssessment(dto, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/calculate")
    @PreAuthorize("hasAnyRole('UNDERWRITER', 'INSURANCE_MANAGER', 'CLAIMS_ADJUSTER', 'POLICYHOLDER')")
    @Operation(summary = "Interactive real-time actuarial risk score & multiplier calculator")
    public ResponseEntity<RiskCalculationResponseDTO> calculateRisk(@RequestBody RiskCalculationRequestDTO request) {
        return ResponseEntity.ok(riskAssessmentService.calculateRisk(request));
    }

    @GetMapping("/policy/{policyId}")
    @PreAuthorize("hasAnyRole('UNDERWRITER', 'INSURANCE_MANAGER', 'CLAIMS_ADJUSTER', 'POLICYHOLDER')")
    @Operation(summary = "Retrieve risk assessment audit history for a policy")
    public ResponseEntity<List<RiskAssessment>> getAssessmentsByPolicyId(@PathVariable Long policyId) {
        return ResponseEntity.ok(riskAssessmentService.getAssessmentsByPolicyId(policyId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('UNDERWRITER', 'INSURANCE_MANAGER', 'CLAIMS_ADJUSTER', 'POLICYHOLDER')")
    @Operation(summary = "Retrieve all risk assessments in registry")
    public ResponseEntity<List<RiskAssessment>> getAllAssessments() {
        return ResponseEntity.ok(riskAssessmentService.getAllAssessments());
    }
}
