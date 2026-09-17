package com.insureflow.service;

import com.insureflow.dto.TrialCreationDTO;
import com.insureflow.exception.BusinessValidationException;
import com.insureflow.exception.ResourceNotFoundException;
import com.insureflow.model.ClaimSubmission;
import com.insureflow.model.InsurancePolicy;
import com.insureflow.model.PolicyStatus;
import com.insureflow.model.RiskAssessment;
import com.insureflow.model.RiskTier;
import com.insureflow.model.SystemAccount;
import com.insureflow.repository.ClaimDisbursementRepository;
import com.insureflow.repository.ClaimSubmissionRepository;
import com.insureflow.repository.InsurancePolicyRepository;
import com.insureflow.repository.RiskAssessmentRepository;
import com.insureflow.repository.SystemAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PolicyUnderwritingService {

    private final InsurancePolicyRepository policyRepository;
    private final SystemAccountRepository accountRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final ClaimSubmissionRepository claimSubmissionRepository;
    private final ClaimDisbursementRepository claimDisbursementRepository;

    @Transactional
    public InsurancePolicy createSeedPolicy(TrialCreationDTO dto) {
        SystemAccount policyholder = accountRepository.findById(dto.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Policyholder account not found with ID: " + dto.getAccountId()));

        if (dto.getEffectiveDate().isAfter(dto.getExpiryDate())) {
            throw new BusinessValidationException("Policy effective date must be before expiry date.");
        }

        String policyNumber = dto.getPolicyNumber();
        if (policyNumber == null || policyNumber.isBlank()) {
            policyNumber = generateUniquePolicyNumber();
        } else {
            if (policyRepository.findByPolicyNumber(policyNumber).isPresent()) {
                throw new BusinessValidationException("Policy number " + policyNumber + " already exists.");
            }
        }

        InsurancePolicy policy = InsurancePolicy.builder()
                .policyNumber(policyNumber)
                .account(policyholder)
                .coverageType(dto.getCoverageType())
                .premiumAmount(dto.getPremiumAmount())
                .maxCoverageLimit(dto.getMaxCoverageLimit())
                .remainingLimit(dto.getMaxCoverageLimit()) // Dynamic buffer initialized to full capacity
                .policyStatus(PolicyStatus.PENDING)
                .effectiveDate(dto.getEffectiveDate())
                .expiryDate(dto.getExpiryDate())
                .build();

        return policyRepository.save(policy);
    }

    public List<InsurancePolicy> getAllPolicies() {
        return policyRepository.findAll();
    }

    public InsurancePolicy getPolicyById(Long id) {
        return policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance policy not found with ID: " + id));
    }

    public List<InsurancePolicy> getMyPoliciesByEmail(String email) {
        return policyRepository.findByAccount_Email(email);
    }

    @Transactional
    public InsurancePolicy activatePolicy(Long id) {
        InsurancePolicy policy = getPolicyById(id);

        if (policy.getPolicyStatus() == PolicyStatus.ACTIVE) {
            throw new BusinessValidationException("Policy is already ACTIVE.");
        }

        if (policy.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessValidationException("Cannot activate an already expired policy.");
        }

        // Auto-provision standard baseline risk assessment if none exists yet
        boolean hasRiskAssessment = riskAssessmentRepository.existsByPolicy_Id(id);
        if (!hasRiskAssessment) {
            RiskAssessment baseline = RiskAssessment.builder()
                    .policy(policy)
                    .riskScore(25)
                    .riskTier(RiskTier.LOW)
                    .medicalHistoryFlag(false)
                    .occupationalHazardFlag(false)
                    .underwritingNotes("Standard actuarial assessment recorded during policy activation.")
                    .build();
            riskAssessmentRepository.save(baseline);
        }

        policy.setPolicyStatus(PolicyStatus.ACTIVE);
        return policyRepository.save(policy);
    }

    @Transactional
    public void deletePolicy(Long id) {
        InsurancePolicy policy = getPolicyById(id);

        // 1. Delete associated disbursements and claims
        List<ClaimSubmission> claims = claimSubmissionRepository.findByPolicy_Id(id);
        for (ClaimSubmission claim : claims) {
            claimDisbursementRepository.findByClaim_Id(claim.getId())
                    .ifPresent(claimDisbursementRepository::delete);
            claimSubmissionRepository.delete(claim);
        }

        // 2. Delete associated risk assessments
        List<RiskAssessment> assessments = riskAssessmentRepository.findByPolicy_Id(id);
        riskAssessmentRepository.deleteAll(assessments);

        // 3. Delete the policy
        policyRepository.delete(policy);
    }

    private String generateUniquePolicyNumber() {
        Random random = new Random();
        String candidate;
        do {
            int digits = 100000 + random.nextInt(900000);
            candidate = "POL-" + digits;
        } while (policyRepository.findByPolicyNumber(candidate).isPresent());
        return candidate;
    }
}
