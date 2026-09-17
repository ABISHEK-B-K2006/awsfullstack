package com.insureflow.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentRequestDTO {

    @NotNull(message = "Policy ID is required")
    private Long policyId;

    @NotNull(message = "Incident date is required")
    @PastOrPresent(message = "Incident date cannot be in the future")
    private LocalDate incidentDate;

    @NotBlank(message = "Incident description is required")
    private String incidentDescription;

    @NotNull(message = "Requested payout is required")
    @Positive(message = "Requested payout must be positive")
    private BigDecimal requestedPayout;
}
