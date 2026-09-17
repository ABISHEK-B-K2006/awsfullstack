package com.insureflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "claim_submission")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "Claim number is required")
    private String claimNumber; // CLM-XXXX

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "policy_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InsurancePolicy policy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "claimant_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "hibernateLazyInitializer", "handler"})
    private SystemAccount claimant;

    @Column(nullable = false)
    @NotNull(message = "Incident date is required")
    @PastOrPresent(message = "Incident date cannot be in the future")
    private LocalDate incidentDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank(message = "Incident description is required")
    private String incidentDescription;

    @Column(nullable = false, precision = 12, scale = 2)
    @NotNull(message = "Requested payout is required")
    @Positive(message = "Requested payout must be positive")
    private BigDecimal requestedPayout;

    @Column(precision = 12, scale = 2)
    private BigDecimal approvedPayout;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ClaimStatus claimStatus; // SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED

    @Column(columnDefinition = "TEXT")
    private String adjudicationNotes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime filedAt;
}
