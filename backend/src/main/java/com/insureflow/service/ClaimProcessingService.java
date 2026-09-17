package com.insureflow.service;

import com.insureflow.dto.ClaimReviewDTO;
import com.insureflow.dto.EnrollmentRequestDTO;
import com.insureflow.dto.ObservationDTO;
import com.insureflow.exception.BusinessValidationException;
import com.insureflow.exception.ResourceNotFoundException;
import com.insureflow.model.*;
import com.insureflow.repository.ClaimDisbursementRepository;
import com.insureflow.repository.ClaimSubmissionRepository;
import com.insureflow.repository.InsurancePolicyRepository;
import com.insureflow.repository.SystemAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClaimProcessingService {

    private final ClaimSubmissionRepository claimRepository;
    private final InsurancePolicyRepository policyRepository;
    private final ClaimDisbursementRepository disbursementRepository;
    private final SystemAccountRepository accountRepository;

    @Transactional
    public ClaimSubmission submitClaim(EnrollmentRequestDTO dto, String claimantEmail) {
        SystemAccount claimant = accountRepository.findByEmail(claimantEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Claimant account not found with email: " + claimantEmail));

        InsurancePolicy policy = policyRepository.findById(dto.getPolicyId())
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + dto.getPolicyId()));

        if (policy.getPolicyStatus() != PolicyStatus.ACTIVE) {
            throw new BusinessValidationException("Cannot file claims against policy that is not ACTIVE (Current status: " + policy.getPolicyStatus() + ")");
        }

        if (dto.getIncidentDate().isAfter(LocalDate.now())) {
            throw new BusinessValidationException("Incident date cannot be in the future.");
        }

        if (dto.getIncidentDate().isBefore(policy.getEffectiveDate()) || dto.getIncidentDate().isAfter(policy.getExpiryDate())) {
            throw new BusinessValidationException("Incident date (" + dto.getIncidentDate() + ") must be within the active policy coverage term ("
                    + policy.getEffectiveDate() + " to " + policy.getExpiryDate() + ").");
        }

        // Validate that requested amount does not exceed the remaining buffer
        if (dto.getRequestedPayout().compareTo(policy.getRemainingLimit()) > 0) {
            throw new BusinessValidationException("Requested payout $" + dto.getRequestedPayout() +
                    " exceeds dynamic policy capacity buffer $" + policy.getRemainingLimit());
        }

        String claimNumber = generateUniqueClaimNumber();

        ClaimSubmission claim = ClaimSubmission.builder()
                .claimNumber(claimNumber)
                .policy(policy)
                .claimant(claimant)
                .incidentDate(dto.getIncidentDate())
                .incidentDescription(dto.getIncidentDescription())
                .requestedPayout(dto.getRequestedPayout())
                .claimStatus(ClaimStatus.SUBMITTED)
                .build();

        return claimRepository.save(claim);
    }

    @Transactional
    public ClaimSubmission reviewClaim(Long claimId, ClaimReviewDTO dto) {
        ClaimSubmission claim = getClaimById(claimId);
        if (claim.getClaimStatus() != ClaimStatus.SUBMITTED && claim.getClaimStatus() != ClaimStatus.UNDER_REVIEW) {
            throw new BusinessValidationException("Cannot review already decided claim (Status: " + claim.getClaimStatus() + ")");
        }

        claim.setClaimStatus(ClaimStatus.UNDER_REVIEW);
        claim.setAdjudicationNotes("Adjuster Review: " + dto.getReviewNotes() + " [Recommendation: " + dto.getRecommendation() + "]");
        return claimRepository.save(claim);
    }

    /**
     * Executes claim adjudication with Pessimistic Write Lock on InsurancePolicy row to prevent race conditions.
     */
    @Transactional
    public ClaimSubmission adjudicateClaim(Long claimId, ObservationDTO observationDTO) {
        ClaimSubmission claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim notice not found with ID: " + claimId));

        if (claim.getClaimStatus() != ClaimStatus.SUBMITTED && claim.getClaimStatus() != ClaimStatus.UNDER_REVIEW) {
            throw new BusinessValidationException("Claim is already finalized with status: " + claim.getClaimStatus());
        }

        // Acquire Pessimistic Write Lock on Policy Row to prevent concurrent over-disbursements
        log.info("Acquiring Pessimistic Write Lock on InsurancePolicy ID: {}", claim.getPolicy().getId());
        InsurancePolicy policy = policyRepository.findByIdWithPessimisticWrite(claim.getPolicy().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Associated policy not found for locking"));

        if (policy.getPolicyStatus() != PolicyStatus.ACTIVE) {
            throw new BusinessValidationException("Cannot adjudicate claims against an inactive policy contract");
        }

        if ("APPROVED".equalsIgnoreCase(observationDTO.getDecision())) {
            BigDecimal approvedPayout = observationDTO.getApprovedAmount() != null ?
                    observationDTO.getApprovedAmount() : claim.getRequestedPayout();

            if (approvedPayout.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessValidationException("Approved payout amount must be strictly positive.");
            }

            if (policy.getRemainingLimit().compareTo(approvedPayout) < 0) {
                throw new BusinessValidationException("Requested payout $" + approvedPayout +
                        " exceeds dynamic remaining capacity buffer $" + policy.getRemainingLimit());
            }

            // Deduct from policy remaining buffer atomically
            BigDecimal newLimit = policy.getRemainingLimit().subtract(approvedPayout);
            policy.setRemainingLimit(newLimit);
            policyRepository.save(policy);
            log.info("Policy {} capacity buffer deducted by ${}. New remaining limit: ${}", policy.getPolicyNumber(), approvedPayout, newLimit);

            claim.setApprovedPayout(approvedPayout);
            claim.setClaimStatus(ClaimStatus.APPROVED);
            claim.setAdjudicationNotes(observationDTO.getAdjudicationNotes() != null ?
                    observationDTO.getAdjudicationNotes() : "Approved by Insurance Manager via Transactional Concurrency Engine.");

            ClaimSubmission savedClaim = claimRepository.save(claim);

            // Auto-schedule financial disbursement wire transfer
            ClaimDisbursement disbursement = ClaimDisbursement.builder()
                    .claim(savedClaim)
                    .disbursementAmount(approvedPayout)
                    .bankRoutingNumber("021000021")
                    .bankAccountNumber("ACCT-" + claim.getClaimant().getId() + "49" + (100 + new Random().nextInt(900)))
                    .executionStatus(DisbursementStatus.SCHEDULED)
                    .build();
            disbursementRepository.save(disbursement);
            log.info("Auto-scheduled ClaimDisbursement for claim {}", savedClaim.getClaimNumber());

            return savedClaim;
        } else {
            claim.setClaimStatus(ClaimStatus.REJECTED);
            claim.setApprovedPayout(BigDecimal.ZERO);
            claim.setAdjudicationNotes(observationDTO.getAdjudicationNotes() != null ?
                    observationDTO.getAdjudicationNotes() : "Rejected by Insurance Manager following actuarial policy guidelines.");
            return claimRepository.save(claim);
        }
    }

    public List<ClaimSubmission> getAllClaims() {
        return claimRepository.findAll();
    }

    public List<ClaimSubmission> getMyClaims(String email) {
        return claimRepository.findByClaimant_Email(email);
    }

    public ClaimSubmission getClaimById(Long claimId) {
        return claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim notice not found with ID: " + claimId));
    }

    @Transactional
    public void deleteClaim(Long claimId) {
        ClaimSubmission claim = getClaimById(claimId);
        if (claim.getClaimStatus() == ClaimStatus.APPROVED) {
            throw new BusinessValidationException("Cannot delete an already approved and settled claim.");
        }
        disbursementRepository.findByClaim_Id(claimId)
                .ifPresent(disbursementRepository::delete);
        claimRepository.delete(claim);
    }

    private String generateUniqueClaimNumber() {
        Random random = new Random();
        String candidate;
        do {
            int digits = 1000 + random.nextInt(9000);
            candidate = "CLM-" + digits;
        } while (claimRepository.findByClaimNumber(candidate).isPresent());
        return candidate;
    }
}
