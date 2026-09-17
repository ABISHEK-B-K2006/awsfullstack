package com.insureflow.config;

import com.insureflow.model.*;
import com.insureflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final SystemAccountRepository accountRepository;
    private final InsurancePolicyRepository policyRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final ClaimSubmissionRepository claimRepository;
    private final ClaimDisbursementRepository disbursementRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (accountRepository.count() > 0) {
            log.info("InsureFlow database already seeded. Skipping initial data provisioning.");
            return;
        }

        log.info("Initializing InsureFlow Enterprise seed data across all 4 stakeholder roles...");

        // 1. Create Default Stakeholder Accounts
        SystemAccount policyholder = SystemAccount.builder()
                .email("holder@insureflow.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Abishek Claimant")
                .role(Role.ROLE_POLICYHOLDER)
                .isActive(true)
                .build();
        accountRepository.save(policyholder);

        SystemAccount underwriter = SystemAccount.builder()
                .email("underwriter@insureflow.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Sarah Jenkins (Senior Underwriter)")
                .role(Role.ROLE_UNDERWRITER)
                .isActive(true)
                .build();
        accountRepository.save(underwriter);

        SystemAccount adjuster = SystemAccount.builder()
                .email("adjuster@insureflow.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Marcus Vance (Lead Adjuster)")
                .role(Role.ROLE_CLAIMS_ADJUSTER)
                .isActive(true)
                .build();
        accountRepository.save(adjuster);

        SystemAccount manager = SystemAccount.builder()
                .email("manager@insureflow.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Eleanor Vance (Manager)")
                .role(Role.ROLE_INSURANCE_MANAGER)
                .isActive(true)
                .build();
        accountRepository.save(manager);

        SystemAccount client2 = SystemAccount.builder()
                .email("client@insureflow.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("David Miller")
                .role(Role.ROLE_POLICYHOLDER)
                .isActive(true)
                .build();
        accountRepository.save(client2);

        // 2. Create Insurance Policies
        InsurancePolicy policy1 = InsurancePolicy.builder()
                .policyNumber("POL-100200")
                .account(policyholder)
                .coverageType("Comprehensive Commercial Property")
                .premiumAmount(new BigDecimal("4200.00"))
                .maxCoverageLimit(new BigDecimal("250000.00"))
                .remainingLimit(new BigDecimal("235000.00")) // $15,000 settled claim deducted
                .policyStatus(PolicyStatus.ACTIVE)
                .effectiveDate(LocalDate.now().minusMonths(6))
                .expiryDate(LocalDate.now().plusMonths(6))
                .build();
        policyRepository.save(policy1);

        InsurancePolicy policy2 = InsurancePolicy.builder()
                .policyNumber("POL-200450")
                .account(policyholder)
                .coverageType("Executive Fleet & Commercial Auto")
                .premiumAmount(new BigDecimal("2800.00"))
                .maxCoverageLimit(new BigDecimal("80000.00"))
                .remainingLimit(new BigDecimal("80000.00"))
                .policyStatus(PolicyStatus.ACTIVE)
                .effectiveDate(LocalDate.now().minusMonths(4))
                .expiryDate(LocalDate.now().plusMonths(8))
                .build();
        policyRepository.save(policy2);

        InsurancePolicy policy3 = InsurancePolicy.builder()
                .policyNumber("POL-300780")
                .account(client2)
                .coverageType("Corporate Executive Health & Medical")
                .premiumAmount(new BigDecimal("3500.00"))
                .maxCoverageLimit(new BigDecimal("150000.00"))
                .remainingLimit(new BigDecimal("118500.00")) // $31,500 settled claim deducted
                .policyStatus(PolicyStatus.ACTIVE)
                .effectiveDate(LocalDate.now().minusMonths(3))
                .expiryDate(LocalDate.now().plusMonths(9))
                .build();
        policyRepository.save(policy3);

        InsurancePolicy policy4 = InsurancePolicy.builder()
                .policyNumber("POL-400920")
                .account(policyholder)
                .coverageType("Cyber Security & Critical Data Breach")
                .premiumAmount(new BigDecimal("8500.00"))
                .maxCoverageLimit(new BigDecimal("500000.00"))
                .remainingLimit(new BigDecimal("500000.00"))
                .policyStatus(PolicyStatus.ACTIVE)
                .effectiveDate(LocalDate.now().minusMonths(2))
                .expiryDate(LocalDate.now().plusMonths(10))
                .build();
        policyRepository.save(policy4);

        InsurancePolicy policy5 = InsurancePolicy.builder()
                .policyNumber("POL-500110")
                .account(client2)
                .coverageType("Heavy Industrial & Marine Cargo")
                .premiumAmount(new BigDecimal("6200.00"))
                .maxCoverageLimit(new BigDecimal("320000.00"))
                .remainingLimit(new BigDecimal("320000.00"))
                .policyStatus(PolicyStatus.PENDING) // Pending underwriting review
                .effectiveDate(LocalDate.now().plusDays(5))
                .expiryDate(LocalDate.now().plusYears(1))
                .build();
        policyRepository.save(policy5);

        // 3. Create Risk Assessments
        RiskAssessment risk1 = RiskAssessment.builder()
                .policy(policy1)
                .assessor(underwriter)
                .riskScore(28)
                .riskTier(RiskTier.LOW)
                .medicalHistoryFlag(false)
                .occupationalHazardFlag(false)
                .underwritingNotes("Property inspections passed with A+ structural integrity. Fire suppression systems certified.")
                .build();
        riskAssessmentRepository.save(risk1);

        RiskAssessment risk2 = RiskAssessment.builder()
                .policy(policy2)
                .assessor(underwriter)
                .riskScore(45)
                .riskTier(RiskTier.MEDIUM)
                .medicalHistoryFlag(false)
                .occupationalHazardFlag(true)
                .underwritingNotes("Fleet includes transit across inter-state expressways. Telematics monitoring mandated.")
                .build();
        riskAssessmentRepository.save(risk2);

        RiskAssessment risk3 = RiskAssessment.builder()
                .policy(policy3)
                .assessor(underwriter)
                .riskScore(32)
                .riskTier(RiskTier.LOW)
                .medicalHistoryFlag(false)
                .occupationalHazardFlag(false)
                .underwritingNotes("Executive group health tier with comprehensive preventive wellness coverage.")
                .build();
        riskAssessmentRepository.save(risk3);

        RiskAssessment risk4 = RiskAssessment.builder()
                .policy(policy4)
                .assessor(underwriter)
                .riskScore(22)
                .riskTier(RiskTier.LOW)
                .medicalHistoryFlag(false)
                .occupationalHazardFlag(false)
                .underwritingNotes("ISO 27001 and SOC 2 Type II compliance verified. Multi-factor authentication fully enforced.")
                .build();
        riskAssessmentRepository.save(risk4);

        // 4. Create Claims
        ClaimSubmission claim1 = ClaimSubmission.builder()
                .claimNumber("CLM-8492")
                .policy(policy1)
                .claimant(policyholder)
                .incidentDate(LocalDate.now().minusMonths(2))
                .incidentDescription("Water supply pipe leakage causing cosmetic ceiling and drywall damage on Level 2 office suite.")
                .requestedPayout(new BigDecimal("15000.00"))
                .approvedPayout(new BigDecimal("15000.00"))
                .claimStatus(ClaimStatus.APPROVED)
                .adjudicationNotes("Verified plumbing contractor invoices and adjuster site report. Approved full payout.")
                .build();
        claimRepository.save(claim1);

        ClaimSubmission claim2 = ClaimSubmission.builder()
                .claimNumber("CLM-9031")
                .policy(policy3)
                .claimant(client2)
                .incidentDate(LocalDate.now().minusWeeks(3))
                .incidentDescription("Emergency orthopedic surgical procedure following accidental fall during company offsite.")
                .requestedPayout(new BigDecimal("31500.00"))
                .approvedPayout(new BigDecimal("31500.00"))
                .claimStatus(ClaimStatus.APPROVED)
                .adjudicationNotes("Hospital itemized records cross-checked with network rates. Claim approved.")
                .build();
        claimRepository.save(claim2);

        ClaimSubmission claim3 = ClaimSubmission.builder()
                .claimNumber("CLM-2104")
                .policy(policy2)
                .claimant(policyholder)
                .incidentDate(LocalDate.now().minusWeeks(1))
                .incidentDescription("Minor collision involving commercial logistics delivery van during rainfall.")
                .requestedPayout(new BigDecimal("12800.00"))
                .claimStatus(ClaimStatus.UNDER_REVIEW)
                .adjudicationNotes("Adjuster Review: Police FIR filed and workshop body repair estimate received. Awaiting dashcam footage.")
                .build();
        claimRepository.save(claim3);

        ClaimSubmission claim4 = ClaimSubmission.builder()
                .claimNumber("CLM-4910")
                .policy(policy1)
                .claimant(policyholder)
                .incidentDate(LocalDate.now().minusDays(3))
                .incidentDescription("Electrical short-circuit damaged HVAC compressor unit on commercial building rooftop.")
                .requestedPayout(new BigDecimal("18500.00"))
                .claimStatus(ClaimStatus.SUBMITTED)
                .build();
        claimRepository.save(claim4);

        // 5. Create Claim Disbursements
        ClaimDisbursement disb1 = ClaimDisbursement.builder()
                .claim(claim1)
                .disbursementAmount(new BigDecimal("15000.00"))
                .bankRoutingNumber("021000021")
                .bankAccountNumber("ACCT-9021-4820")
                .executionStatus(DisbursementStatus.COMPLETED)
                .transactionHash("ACH-TXN-849201948")
                .disbursementDate(LocalDateTime.now().minusDays(14))
                .build();
        disbursementRepository.save(disb1);

        ClaimDisbursement disb2 = ClaimDisbursement.builder()
                .claim(claim2)
                .disbursementAmount(new BigDecimal("31500.00"))
                .bankRoutingNumber("021000021")
                .bankAccountNumber("ACCT-3310-7712")
                .executionStatus(DisbursementStatus.SCHEDULED)
                .build();
        disbursementRepository.save(disb2);

        log.info("InsureFlow enterprise seed data loaded successfully with 5 accounts, 5 policies, 4 risk assessments, 4 claims, and 2 disbursements.");
    }
}
