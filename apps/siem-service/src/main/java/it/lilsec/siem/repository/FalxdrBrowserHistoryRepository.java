package it.lilsec.siem.repository;

import it.lilsec.siem.entity.FalxdrBrowserHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface FalxdrBrowserHistoryRepository extends JpaRepository<FalxdrBrowserHistory, UUID> {
    List<FalxdrBrowserHistory> findTop20ByEndpointIdOrderByVisitedAtDesc(UUID endpointId);
}