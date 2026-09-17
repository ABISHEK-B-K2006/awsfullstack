package com.insureflow.dto;

import com.insureflow.model.RiskTier;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskCalculationResponseDTO {
    private Integer calculatedScore;
    private RiskTier riskTier;
    private BigDecimal recommendedPremiumMultiplier;
    private List<String> identifiedRiskFactors;
    private String rationale;
}
