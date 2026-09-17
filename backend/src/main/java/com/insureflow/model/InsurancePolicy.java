package com.insureflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "insurance_policy")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsurancePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "Policy number is required")
    private String policyNumber; // POL-XXXXXX

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "hibernateLazyInitializer", "handler"})
    private SystemAccount account;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Coverage type is required")
    private String coverageType;

    @Column(nullable = false, precision = 12, scale = 2)
    @NotNull(message = "Premium amount is required")
    @Positive(message = "Premium amount must be positive")
    private BigDecimal premiumAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    @NotNull(message = "Max coverage limit is required")
    @Positive(message = "Max coverage limit must be positive")
    private BigDecimal maxCoverageLimit;

    @Column(nullable = false, precision = 12, scale = 2)
    @NotNull(message = "Remaining limit is required")
    @PositiveOrZero(message = "Remaining limit must be positive or zero")
    private BigDecimal remainingLimit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @NotNull(message = "Policy status is required")
    private PolicyStatus policyStatus; // PENDING, ACTIVE, EXPIRED, CANCELLED

    @Column(nullable = false)
    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;

    @Column(nullable = false)
    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;
}
