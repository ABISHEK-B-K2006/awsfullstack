package com.insureflow.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdverseEventDTO {

    @NotNull(message = "Policy ID is required")
    private Long policyId;

    @Min(value = 0, message = "Risk score must be at least 0")
    @Max(value = 100, message = "Risk score cannot exceed 100")
    private Integer riskScore;

    @NotNull(message = "Medical history flag is required")
    private Boolean medicalHistoryFlag;

    @NotNull(message = "Occupational hazard flag is required")
    private Boolean occupationalHazardFlag;

    @NotBlank(message = "Underwriting notes are required")
    private String underwritingNotes;
}
