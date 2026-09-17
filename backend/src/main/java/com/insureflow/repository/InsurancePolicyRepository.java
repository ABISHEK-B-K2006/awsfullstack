package com.insureflow.repository;

import com.insureflow.model.InsurancePolicy;
import com.insureflow.model.PolicyStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy, Long> {

    Optional<InsurancePolicy> findByPolicyNumber(String policyNumber);

    Optional<InsurancePolicy> findByPolicyNumberIgnoreCase(String policyNumber);

    List<InsurancePolicy> findByAccount_Email(String email);

    List<InsurancePolicy> findByAccount_Id(Long accountId);

    List<InsurancePolicy> findByPolicyStatus(PolicyStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM InsurancePolicy p WHERE p.id = :id")
    Optional<InsurancePolicy> findByIdWithPessimisticWrite(@Param("id") Long id);

    long countByPolicyStatus(PolicyStatus status);
}
