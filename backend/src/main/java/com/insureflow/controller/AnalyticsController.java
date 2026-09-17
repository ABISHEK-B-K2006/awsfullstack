package com.insureflow.controller;

import com.insureflow.dto.AnalyticsMetricsDTO;
import com.insureflow.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Platform Analytics & Health Monitoring", description = "Endpoints for platform metrics, loss ratios, and operational health KPIs")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/metrics")
    @PreAuthorize("hasAnyRole('INSURANCE_MANAGER', 'UNDERWRITER', 'CLAIMS_ADJUSTER', 'POLICYHOLDER')")
    @Operation(summary = "Aggregate platform-wide operational health & financial loss ratio metrics")
    public ResponseEntity<AnalyticsMetricsDTO> getPlatformMetrics() {
        return ResponseEntity.ok(analyticsService.getPlatformMetrics());
    }
}
