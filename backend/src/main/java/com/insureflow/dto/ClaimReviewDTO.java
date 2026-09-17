package com.insureflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimReviewDTO {
    @NotBlank(message = "Review notes are required")
    private String reviewNotes;

    private String recommendation; // RECOMMEND_APPROVAL, RECOMMEND_REJECTION, REQUEST_MORE_INFO
}
