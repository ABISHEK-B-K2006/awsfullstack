package com.insureflow.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsMetricsDTO {
    private long totalPolicies;
    private long activePolicies;
    private long pendingPolicies;
    private BigDecimal totalCoverageCapacity;
    private BigDecimal totalRemainingLimit;

    private long totalClaims;
    private long pendingClaims;
    private long underReviewClaims;
    private long approvedClaims;
    private long rejectedClaims;

    private BigDecimal totalClaimedAmount;
    private BigDecimal totalApprovedPayouts;
    private BigDecimal totalDisbursedPayouts;

    private BigDecimal actuarialLossRatio; // (totalApprovedPayouts / totalCoverageCapacity) * 100
    private double underwritingEfficiencyScore;

    private Map<String, Long> riskTierDistribution;
    private Map<String, Long> coverageTypeDistribution;
    private long activeDisbursementsScheduled;
    private long completedDisbursements;
}
