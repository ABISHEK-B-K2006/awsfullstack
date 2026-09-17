package com.insureflow.controller;

import com.insureflow.dto.DisbursementExecutionDTO;
import com.insureflow.model.ClaimDisbursement;
import com.insureflow.service.DisbursementOrchestrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/disbursements")
@RequiredArgsConstructor
@Tag(name = "Financial Disbursement & Wire Settlement Engine", description = "Endpoints for electronic ACH wire transfer orchestration and execution")
public class DisbursementController {

    private final DisbursementOrchestrationService disbursementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('INSURANCE_MANAGER', 'CLAIMS_ADJUSTER', 'UNDERWRITER', 'POLICYHOLDER')")
    @Operation(summary = "Retrieve all scheduled and executed wire disbursements")
    public ResponseEntity<List<ClaimDisbursement>> getAllDisbursements() {
        return ResponseEntity.ok(disbursementService.getAllDisbursements());
    }

    @GetMapping("/my-disbursements")
    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'INSURANCE_MANAGER', 'CLAIMS_ADJUSTER', 'UNDERWRITER')")
    @Operation(summary = "Retrieve wire disbursements linked to logged-in claimant")
    public ResponseEntity<List<ClaimDisbursement>> getMyDisbursements(Authentication authentication) {
        return ResponseEntity.ok(disbursementService.getMyDisbursements(authentication.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSURANCE_MANAGER', 'CLAIMS_ADJUSTER', 'POLICYHOLDER')")
    @Operation(summary = "Retrieve disbursement details by ID")
    public ResponseEntity<ClaimDisbursement> getDisbursementById(@PathVariable Long id) {
        return ResponseEntity.ok(disbursementService.getDisbursementById(id));
    }

    @PostMapping("/{id}/execute")
    @PreAuthorize("hasRole('INSURANCE_MANAGER')")
    @Operation(summary = "Execute automated ACH electronic wire transfer for approved claim")
    public ResponseEntity<ClaimDisbursement> executeDisbursement(
            @PathVariable Long id,
            @RequestBody(required = false) DisbursementExecutionDTO dto) {
        return ResponseEntity.ok(disbursementService.executeDisbursement(id, dto));
    }
}
