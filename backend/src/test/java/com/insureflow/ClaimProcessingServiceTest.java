package com.insureflow;

import com.insureflow.dto.ObservationDTO;
import com.insureflow.exception.BusinessValidationException;
import com.insureflow.model.ClaimStatus;
import com.insureflow.model.ClaimSubmission;
import com.insureflow.model.InsurancePolicy;
import com.insureflow.repository.ClaimSubmissionRepository;
import com.insureflow.repository.InsurancePolicyRepository;
import com.insureflow.service.ClaimProcessingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ClaimProcessingServiceTest {

    @Autowired
    private ClaimProcessingService claimService;

    @Autowired
    private ClaimSubmissionRepository claimRepository;

    @Autowired
    private InsurancePolicyRepository policyRepository;

    @Test
    @DisplayName("Test Case 5.4.2: Policy Capacity Buffer Validation - Overdraw Rejection")
    void testPolicyCapacityBufferValidation_OverdrawRejected() {
        // Find submitted claim CLM-4910 on policy POL-100200
        ClaimSubmission claim = claimRepository.findByClaimNumber("CLM-4910")
                .orElseThrow(() -> new RuntimeException("Test claim CLM-4910 not found"));

        InsurancePolicy policy = claim.getPolicy();
        BigDecimal remainingLimit = policy.getRemainingLimit(); // e.g. 235000.00

        // Attempt to approve an amount larger than remaining limit
        BigDecimal excessiveAmount = remainingLimit.add(new BigDecimal("50000.00"));
        ObservationDTO observationDTO = ObservationDTO.builder()
                .decision("APPROVED")
                .approvedAmount(excessiveAmount)
                .adjudicationNotes("Testing overdraw protection")
                .build();

        BusinessValidationException exception = assertThrows(BusinessValidationException.class, () -> {
            claimService.adjudicateClaim(claim.getId(), observationDTO);
        });

        assertTrue(exception.getMessage().contains("exceeds dynamic remaining capacity buffer"));
    }

    @Test
    @DisplayName("Claim Adjudication Success with Pessimistic Lock and Dynamic Buffer Deduction")
    void testClaimAdjudicationSuccess() {
        ClaimSubmission claim = claimRepository.findByClaimNumber("CLM-4910")
                .orElseThrow(() -> new RuntimeException("Test claim CLM-4910 not found"));

        InsurancePolicy policy = claim.getPolicy();
        BigDecimal limitBefore = policy.getRemainingLimit();
        BigDecimal approvedAmount = new BigDecimal("10000.00");

        ObservationDTO observationDTO = ObservationDTO.builder()
                .decision("APPROVED")
                .approvedAmount(approvedAmount)
                .adjudicationNotes("Approved following inspection")
                .build();

        ClaimSubmission adjudicated = claimService.adjudicateClaim(claim.getId(), observationDTO);

        assertEquals(ClaimStatus.APPROVED, adjudicated.getClaimStatus());
        assertEquals(approvedAmount, adjudicated.getApprovedPayout());

        InsurancePolicy updatedPolicy = policyRepository.findById(policy.getId()).orElseThrow();
        assertEquals(limitBefore.subtract(approvedAmount), updatedPolicy.getRemainingLimit());
    }
}
