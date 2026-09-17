package com.insureflow.repository;

import com.insureflow.model.RiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {
    List<RiskAssessment> findByPolicy_Id(Long policyId);
    List<RiskAssessment> findByAssessor_Email(String email);
    boolean existsByPolicy_Id(Long policyId);
}
