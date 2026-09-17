package com.insureflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObservationDTO {

    @NotBlank(message = "Decision is required")
    @Pattern(regexp = "^(APPROVED|REJECTED)$", message = "Decision must be either APPROVED or REJECTED")
    private String decision; // APPROVED or REJECTED

    private BigDecimal approvedAmount; // If null, defaults to requestedPayout

    private String adjudicationNotes;
}
