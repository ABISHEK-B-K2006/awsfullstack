package com.insureflow.controller;

import com.insureflow.model.ClaimSubmission;
import com.insureflow.model.InsurancePolicy;
import com.insureflow.repository.ClaimSubmissionRepository;
import com.insureflow.repository.InsurancePolicyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@Tag(name = "Public Insurance Tracking", description = "Publicly accessible endpoint for real-time tracking of policy capacity and claim status")
public class PublicTrackingController {

    private final InsurancePolicyRepository policyRepository;
    private final ClaimSubmissionRepository claimRepository;

    @GetMapping("/track/{code}")
    @Operation(summary = "Track policy capacity or claim status by policy number or claim tracking ID")
    public ResponseEntity<Map<String, Object>> trackByPath(@PathVariable String code) {
        return handleTrack(code);
    }

    @GetMapping("/track")
    @Operation(summary = "Track policy capacity or claim status via query parameter")
    public ResponseEntity<Map<String, Object>> trackByQuery(@RequestParam(required = false, defaultValue = "") String query) {
        return handleTrack(query);
    }

    private ResponseEntity<Map<String, Object>> handleTrack(String rawCode) {
        if (rawCode == null || rawCode.trim().isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Tracking code or policy number is required.");
            return ResponseEntity.badRequest().body(err);
        }

        String code = rawCode.trim();

        // 1. Check if it's a Claim (starts with CLM or matches claim)
        Optional<ClaimSubmission> claimOpt = claimRepository.findByClaimNumberIgnoreCase(code);
        if (claimOpt.isPresent()) {
            ClaimSubmission claim = claimOpt.get();
            Map<String, Object> res = new HashMap<>();
            res.put("type", "CLAIM");
            
            Map<String, Object> data = new HashMap<>();
            data.put("id", claim.getId());
            data.put("claimNumber", claim.getClaimNumber());
            data.put("incidentDate", claim.getIncidentDate());
            data.put("incidentDescription", claim.getIncidentDescription());
            data.put("requestedPayout", claim.getRequestedPayout());
            data.put("approvedPayout", claim.getApprovedPayout());
            data.put("claimStatus", claim.getClaimStatus() != null ? claim.getClaimStatus().name() : "SUBMITTED");
            data.put("adjudicationNotes", claim.getAdjudicationNotes());
            data.put("filedAt", claim.getFiledAt());

            if (claim.getPolicy() != null) {
                Map<String, Object> polData = new HashMap<>();
                polData.put("policyNumber", claim.getPolicy().getPolicyNumber());
                polData.put("coverageType", claim.getPolicy().getCoverageType());
                polData.put("remainingLimit", claim.getPolicy().getRemainingLimit());
                data.put("policy", polData);
            }

            res.put("data", data);
            return ResponseEntity.ok(res);
        }

        // 2. Check if it's a Policy (starts with POL or matches policy)
        Optional<InsurancePolicy> policyOpt = policyRepository.findByPolicyNumberIgnoreCase(code);
        if (policyOpt.isPresent()) {
            InsurancePolicy policy = policyOpt.get();
            Map<String, Object> res = new HashMap<>();
            res.put("type", "POLICY");

            Map<String, Object> data = new HashMap<>();
            data.put("id", policy.getId());
            data.put("policyNumber", policy.getPolicyNumber());
            data.put("coverageType", policy.getCoverageType());
            data.put("policyStatus", policy.getPolicyStatus() != null ? policy.getPolicyStatus().name() : "ACTIVE");
            data.put("maxCoverageLimit", policy.getMaxCoverageLimit());
            data.put("remainingLimit", policy.getRemainingLimit());
            data.put("premiumAmount", policy.getPremiumAmount());
            data.put("effectiveDate", policy.getEffectiveDate());
            data.put("expiryDate", policy.getExpiryDate());

            if (policy.getAccount() != null) {
                Map<String, Object> accData = new HashMap<>();
                accData.put("fullName", maskName(policy.getAccount().getFullName()));
                data.put("account", accData);
            }

            res.put("data", data);
            return ResponseEntity.ok(res);
        }

        // 3. Fallback check: numeric ID check
        try {
            Long numericId = Long.parseLong(code);
            Optional<InsurancePolicy> pById = policyRepository.findById(numericId);
            if (pById.isPresent()) {
                InsurancePolicy policy = pById.get();
                Map<String, Object> res = new HashMap<>();
                res.put("type", "POLICY");

                Map<String, Object> data = new HashMap<>();
                data.put("id", policy.getId());
                data.put("policyNumber", policy.getPolicyNumber());
                data.put("coverageType", policy.getCoverageType());
                data.put("policyStatus", policy.getPolicyStatus() != null ? policy.getPolicyStatus().name() : "ACTIVE");
                data.put("maxCoverageLimit", policy.getMaxCoverageLimit());
                data.put("remainingLimit", policy.getRemainingLimit());
                data.put("premiumAmount", policy.getPremiumAmount());
                data.put("effectiveDate", policy.getEffectiveDate());
                data.put("expiryDate", policy.getExpiryDate());

                if (policy.getAccount() != null) {
                    Map<String, Object> accData = new HashMap<>();
                    accData.put("fullName", maskName(policy.getAccount().getFullName()));
                    data.put("account", accData);
                }

                res.put("data", data);
                return ResponseEntity.ok(res);
            }
        } catch (NumberFormatException ignored) {}

        // Not found
        Map<String, Object> notFound = new HashMap<>();
        notFound.put("error", "No active policy or claim found matching identifier: " + code);
        return ResponseEntity.status(404).body(notFound);
    }

    private String maskName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "Insured Client";
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) return parts[0];
        return parts[0] + " " + parts[parts.length - 1].charAt(0) + ".";
    }
}
