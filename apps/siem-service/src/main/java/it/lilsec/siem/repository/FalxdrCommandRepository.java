package it.lilsec.siem.repository;

import it.lilsec.siem.entity.FalxdrCommand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface FalxdrCommandRepository extends JpaRepository<FalxdrCommand, UUID> {
    List<FalxdrCommand> findAllByEndpointIdOrderByExecutedAtDesc(UUID endpointId);
}