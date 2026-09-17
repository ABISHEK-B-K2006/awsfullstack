package com.insureflow.repository;

import com.insureflow.model.ClaimStatus;
import com.insureflow.model.ClaimSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimSubmissionRepository extends JpaRepository<ClaimSubmission, Long> {

    Optional<ClaimSubmission> findByClaimNumber(String claimNumber);

    Optional<ClaimSubmission> findByClaimNumberIgnoreCase(String claimNumber);

    List<ClaimSubmission> findByClaimant_Email(String email);

    List<ClaimSubmission> findByPolicy_Id(Long policyId);

    List<ClaimSubmission> findByClaimStatus(ClaimStatus claimStatus);

    long countByClaimStatus(ClaimStatus status);

    @Query("SELECT COALESCE(SUM(c.approvedPayout), 0) FROM ClaimSubmission c WHERE c.claimStatus = 'APPROVED'")
    BigDecimal sumApprovedPayouts();

    @Query("SELECT COALESCE(SUM(c.requestedPayout), 0) FROM ClaimSubmission c")
    BigDecimal sumTotalRequestedPayouts();
}
