package com.insureflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "claim_disbursement")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimDisbursement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "claim_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ClaimSubmission claim;

    @Column(nullable = false, precision = 12, scale = 2)
    @NotNull(message = "Disbursement amount is required")
    @Positive(message = "Disbursement amount must be positive")
    private BigDecimal disbursementAmount;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "Bank routing number is required")
    private String bankRoutingNumber;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "Bank account number is required")
    private String bankAccountNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DisbursementStatus executionStatus; // SCHEDULED, PROCESSING, COMPLETED, FAILED

    @Column(length = 100)
    private String transactionHash;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime scheduledAt;

    private LocalDateTime disbursementDate;
}
