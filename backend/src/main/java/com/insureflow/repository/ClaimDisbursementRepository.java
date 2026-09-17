package com.insureflow.repository;

import com.insureflow.model.ClaimDisbursement;
import com.insureflow.model.DisbursementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimDisbursementRepository extends JpaRepository<ClaimDisbursement, Long> {

    Optional<ClaimDisbursement> findByClaim_Id(Long claimId);

    List<ClaimDisbursement> findByExecutionStatus(DisbursementStatus status);

    List<ClaimDisbursement> findByClaim_Claimant_Email(String email);

    long countByExecutionStatus(DisbursementStatus status);

    @Query("SELECT COALESCE(SUM(d.disbursementAmount), 0) FROM ClaimDisbursement d WHERE d.executionStatus = 'COMPLETED'")
    BigDecimal sumCompletedDisbursements();
}
