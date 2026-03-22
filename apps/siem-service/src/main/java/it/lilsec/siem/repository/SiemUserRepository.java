package it.lilsec.siem.repository;

import it.lilsec.siem.entity.SiemUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface SiemUserRepository extends JpaRepository<SiemUser, UUID> {
    Optional<SiemUser> findByUsername(String username);
    List<SiemUser> findAllByTenantId(String tenantId);
}