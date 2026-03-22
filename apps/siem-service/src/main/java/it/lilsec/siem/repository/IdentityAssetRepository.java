package it.lilsec.siem.repository;

import it.lilsec.siem.entity.IdentityAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface IdentityAssetRepository extends JpaRepository<IdentityAsset, UUID> {
    List<IdentityAsset> findAllByTenantIdOrderByPasswordStrengthAsc(String tenantId);
}