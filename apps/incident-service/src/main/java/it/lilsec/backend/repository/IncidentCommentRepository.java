package it.lilsec.backend.repository;

import it.lilsec.backend.model.IncidentComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface IncidentCommentRepository extends JpaRepository<IncidentComment, UUID> {
    List<IncidentComment> findAllByIncidentIdOrderByCreatedAtAsc(UUID incidentId);
}