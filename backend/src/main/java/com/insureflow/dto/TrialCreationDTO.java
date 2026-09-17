package com.insureflow.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialCreationDTO {

    private String policyNumber; // Optional on input, auto-generated if null

    @NotNull(message = "Target policyholder account ID is required")
    private Long accountId;

    @NotBlank(message = "Coverage type is required")
    private String coverageType; // e.g. Comprehensive Auto, Commercial Property, Executive Health, Term Life

    @NotNull(message = "Premium amount is required")
    @Positive(message = "Premium amount must be positive")
    private BigDecimal premiumAmount;

    @NotNull(message = "Max coverage limit is required")
    @Positive(message = "Max coverage limit must be positive")
    private BigDecimal maxCoverageLimit;

    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;
}
