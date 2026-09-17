package com.insureflow.dto;

import com.insureflow.model.RiskTier;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskCalculationRequestDTO {
    private Integer applicantAge;
    private BigDecimal coverageAmount;
    private Boolean medicalHistoryFlag;
    private Boolean occupationalHazardFlag;
    private Boolean previousClaimsFlag;
    private String hazardCategory; // LOW_RISK_RESIDENTIAL, COMMERCIAL, INDUSTRIAL, HIGH_HAZARD
}
