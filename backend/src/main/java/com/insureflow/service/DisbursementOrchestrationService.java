package com.insureflow.service;

import com.insureflow.dto.DisbursementExecutionDTO;
import com.insureflow.exception.BusinessValidationException;
import com.insureflow.exception.ResourceNotFoundException;
import com.insureflow.model.ClaimDisbursement;
import com.insureflow.model.DisbursementStatus;
import com.insureflow.repository.ClaimDisbursementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisbursementOrchestrationService {

    private final ClaimDisbursementRepository disbursementRepository;

    public List<ClaimDisbursement> getAllDisbursements() {
        return disbursementRepository.findAll();
    }

    public List<ClaimDisbursement> getMyDisbursements(String email) {
        return disbursementRepository.findByClaim_Claimant_Email(email);
    }

    public ClaimDisbursement getDisbursementById(Long id) {
        return disbursementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disbursement record not found with ID: " + id));
    }

    @Transactional
    public ClaimDisbursement executeDisbursement(Long id, DisbursementExecutionDTO dto) {
        ClaimDisbursement disbursement = getDisbursementById(id);

        if (disbursement.getExecutionStatus() == DisbursementStatus.COMPLETED) {
            throw new BusinessValidationException("Wire disbursement has already been executed and completed.");
        }

        if (dto != null) {
            if (dto.getBankRoutingNumber() != null && !dto.getBankRoutingNumber().isBlank()) {
                disbursement.setBankRoutingNumber(dto.getBankRoutingNumber());
            }
            if (dto.getBankAccountNumber() != null && !dto.getBankAccountNumber().isBlank()) {
                disbursement.setBankAccountNumber(dto.getBankAccountNumber());
            }
        }

        // Simulate automated clearing house wire execution
        String txHash = "ACH-TXN-" + UUID.randomUUID().toString().substring(0, 13).toUpperCase();
        disbursement.setExecutionStatus(DisbursementStatus.COMPLETED);
        disbursement.setTransactionHash(txHash);
        disbursement.setDisbursementDate(LocalDateTime.now());

        log.info("Disbursement ID {} executed successfully via Wire Network with Hash: {}", id, txHash);
        return disbursementRepository.save(disbursement);
    }
}
