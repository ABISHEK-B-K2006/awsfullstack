package com.insureflow.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisbursementExecutionDTO {
    private String bankRoutingNumber;
    private String bankAccountNumber;
    private String transferRemarks;
}
