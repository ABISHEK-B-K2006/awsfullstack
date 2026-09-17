package com.insureflow.service;

import com.insureflow.dto.AdverseEventDTO;
import com.insureflow.dto.RiskCalculationRequestDTO;
import com.insureflow.dto.RiskCalculationResponseDTO;
import com.insureflow.exception.BusinessValidationException;
import com.insureflow.exception.ResourceNotFoundException;
import com.insureflow.model.InsurancePolicy;
import com.insureflow.model.RiskAssessment;
import com.insureflow.model.RiskTier;
import com.insureflow.model.SystemAccount;
import com.insureflow.repository.InsurancePolicyRepository;
import com.insureflow.repository.RiskAssessmentRepository;
import com.insureflow.repository.SystemAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RiskAssessmentService {

    private final RiskAssessmentRepository riskAssessmentRepository;
    private final InsurancePolicyRepository policyRepository;
    private final SystemAccountRepository accountRepository;

    @Transactional
    public RiskAssessment createRiskAssessment(AdverseEventDTO dto, String assessorEmail) {
        InsurancePolicy policy = policyRepository.findById(dto.getPolicyId())
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + dto.getPolicyId()));

        SystemAccount assessor = accountRepository.findByEmail(assessorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Assessor account not found with email: " + assessorEmail));

        int score = dto.getRiskScore();
        RiskTier tier;
        if (score <= 35) {
            tier = RiskTier.LOW;
        } else if (score <= 70) {
            tier = RiskTier.MEDIUM;
        } else {
            tier = RiskTier.HIGH;
        }

        RiskAssessment assessment = RiskAssessment.builder()
                .policy(policy)
                .assessor(assessor)
                .riskScore(score)
                .riskTier(tier)
                .medicalHistoryFlag(dto.getMedicalHistoryFlag())
                .occupationalHazardFlag(dto.getOccupationalHazardFlag())
                .underwritingNotes(dto.getUnderwritingNotes())
                .build();

        return riskAssessmentRepository.save(assessment);
    }

    public List<RiskAssessment> getAssessmentsByPolicyId(Long policyId) {
        return riskAssessmentRepository.findByPolicy_Id(policyId);
    }

    public List<RiskAssessment> getAllAssessments() {
        return riskAssessmentRepository.findAll();
    }

    public RiskCalculationResponseDTO calculateRisk(RiskCalculationRequestDTO request) {
        int score = 20; // baseline healthy score
        List<String> factors = new ArrayList<>();

        if (request.getApplicantAge() != null) {
            if (request.getApplicantAge() > 60) {
                score += 25;
                factors.add("Senior age bracket (>60 years)");
            } else if (request.getApplicantAge() > 45) {
                score += 15;
                factors.add("Mid-tier age bracket (45-60 years)");
            }
        }

        if (Boolean.TRUE.equals(request.getMedicalHistoryFlag())) {
            score += 30;
            factors.add("Pre-existing medical / historical structural claims history flag detected");
        }

        if (Boolean.TRUE.equals(request.getOccupationalHazardFlag())) {
            score += 20;
            factors.add("High-risk occupational or industrial environment hazard");
        }

        if (Boolean.TRUE.equals(request.getPreviousClaimsFlag())) {
            score += 15;
            factors.add("Prior frequency of insurance loss claims");
        }

        if (request.getHazardCategory() != null) {
            switch (request.getHazardCategory().toUpperCase()) {
                case "HIGH_HAZARD":
                case "INDUSTRIAL":
                    score += 15;
                    factors.add("Industrial / High Hazardous Category classification");
                    break;
                case "COMMERCIAL":
                    score += 8;
                    factors.add("Commercial grade operational asset");
                    break;
                default:
                    break;
            }
        }

        if (score > 100) score = 100;

        RiskTier tier;
        BigDecimal multiplier;
        if (score <= 35) {
            tier = RiskTier.LOW;
            multiplier = new BigDecimal("1.00");
        } else if (score <= 70) {
            tier = RiskTier.MEDIUM;
            multiplier = new BigDecimal("1.35");
        } else {
            tier = RiskTier.HIGH;
            multiplier = new BigDecimal("1.85");
        }

        String rationale = String.format("Actuarial evaluation computed a quantitative risk index of %d/100, categorizing the coverage profile as %s RISK with a recommended premium multiplier of %sx.",
                score, tier.name(), multiplier.toPlainString());

        return RiskCalculationResponseDTO.builder()
                .calculatedScore(score)
                .riskTier(tier)
                .recommendedPremiumMultiplier(multiplier)
                .identifiedRiskFactors(factors)
                .rationale(rationale)
                .build();
    }
}
