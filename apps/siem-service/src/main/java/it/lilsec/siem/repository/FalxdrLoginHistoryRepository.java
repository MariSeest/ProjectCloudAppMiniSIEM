package it.lilsec.siem.repository;

import it.lilsec.siem.entity.FalxdrLoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface FalxdrLoginHistoryRepository extends JpaRepository<FalxdrLoginHistory, UUID> {
    List<FalxdrLoginHistory> findAllByEndpointIdOrderByLoginTimeDesc(UUID endpointId);
}