package com.insureflow.repository;

import com.insureflow.model.Role;
import com.insureflow.model.SystemAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemAccountRepository extends JpaRepository<SystemAccount, Long> {
    Optional<SystemAccount> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<SystemAccount> findByRole(Role role);
}
