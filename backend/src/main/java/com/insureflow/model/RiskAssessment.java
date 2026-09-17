package com.insureflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "risk_assessment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "policy_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InsurancePolicy policy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assessor_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "hibernateLazyInitializer", "handler"})
    private SystemAccount assessor;

    @Column(nullable = false)
    @Min(value = 0, message = "Risk score must be at least 0")
    @Max(value = 100, message = "Risk score cannot exceed 100")
    private Integer riskScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RiskTier riskTier; // LOW, MEDIUM, HIGH

    @Column(nullable = false)
    private Boolean medicalHistoryFlag;

    @Column(nullable = false)
    private Boolean occupationalHazardFlag;

    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank(message = "Underwriting notes are required")
    private String underwritingNotes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime assessmentDate;
}
