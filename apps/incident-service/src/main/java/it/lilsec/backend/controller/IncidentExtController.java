package it.lilsec.backend.controller;

import it.lilsec.backend.dto.*;
import it.lilsec.backend.model.*;
import it.lilsec.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/incidents")
public class IncidentExtController {

    private final IncidentRepository incidentRepo;
    private final IncidentCorrelationRepository correlationRepo;
    private final IncidentCommentRepository commentRepo;

    public IncidentExtController(IncidentRepository incidentRepo,
                                  IncidentCorrelationRepository correlationRepo,
                                  IncidentCommentRepository commentRepo) {
        this.incidentRepo = incidentRepo;
        this.correlationRepo = correlationRepo;
        this.commentRepo = commentRepo;
    }

    @GetMapping("/archived")
    public List<Incident> listArchived() {
        try {
            return incidentRepo.findAllByArchivedTrueOrderByArchivedAtDesc();
        } catch (Exception e) {
            return List.of();
        }
    }

    @GetMapping("/active")
    public List<Incident> listActive() {
        try {
            return incidentRepo.findAllByArchivedFalseOrderByCreatedAtDesc();
        } catch (Exception e) {
            return List.of();
        }
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<Incident> archive(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "system") String archivedBy) {
        Incident inc = incidentRepo.findById(id).orElseThrow();
        inc.setArchived(true);
        inc.setArchivedAt(Instant.now());
        inc.setArchivedBy(archivedBy);
        return ResponseEntity.ok(incidentRepo.save(inc));
    }

    @PostMapping("/{id}/take-charge")
    public ResponseEntity<Incident> takeCharge(
            @PathVariable UUID id,
            @RequestBody TakeChargeRequest req) {
        Incident inc = incidentRepo.findById(id).orElseThrow();
        inc.setTakenChargeAt(Instant.now());
        inc.setTakenChargeBy(req.username());
        inc.setTakenChargeDurationMinutes(req.durationMinutes());
        return ResponseEntity.ok(incidentRepo.save(inc));
    }

    @PostMapping("/correlate")
    public ResponseEntity<CorrelationResponse> correlate(
            @RequestBody CorrelationRequest req) {
        Incident i1 = incidentRepo.findById(req.incidentId1()).orElseThrow();
        Incident i2 = incidentRepo.findById(req.incidentId2()).orElseThrow();
        IncidentCorrelation corr = new IncidentCorrelation();
        corr.setIncident1(i1);
        corr.setIncident2(i2);
        corr.setCorrelationType(req.correlationType());
        corr.setCreatedBy(req.createdBy());
        IncidentCorrelation saved = correlationRepo.save(corr);
        return ResponseEntity.ok(toCorrelationResponse(saved));
    }

    @GetMapping("/{id}/correlations")
    public List<CorrelationResponse> getCorrelations(@PathVariable UUID id) {
        try {
            return correlationRepo.findByIncidentId(id)
                .stream().map(this::toCorrelationResponse).toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    @DeleteMapping("/correlations/{corrId}")
    public ResponseEntity<Void> deleteCorrelation(@PathVariable UUID corrId) {
        correlationRepo.deleteById(corrId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/comments")
    public List<CommentResponse> getComments(@PathVariable UUID id) {
        try {
            return commentRepo.findAllByIncidentIdOrderByCreatedAtAsc(id)
                .stream().map(c -> new CommentResponse(
                    c.getId(), c.getIncident().getId(),
                    c.getAuthorUsername(), c.getAuthorName(),
                    c.getContent(), c.getCreatedAt()
                )).toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @RequestBody CommentRequest req) {
        Incident inc = incidentRepo.findById(id).orElseThrow();
        IncidentComment comment = new IncidentComment();
        comment.setIncident(inc);
        comment.setAuthorUsername(req.authorUsername() != null ? req.authorUsername() : "user");
        comment.setAuthorName(req.authorName() != null ? req.authorName() : "User");
        comment.setContent(req.content());
        IncidentComment saved = commentRepo.save(comment);
        return ResponseEntity.ok(new CommentResponse(
            saved.getId(), id,
            saved.getAuthorUsername(), saved.getAuthorName(),
            saved.getContent(), saved.getCreatedAt()
        ));
    }

    private CorrelationResponse toCorrelationResponse(IncidentCorrelation c) {
        return new CorrelationResponse(
            c.getId(),
            c.getIncident1().getId(), c.getIncident1().getTitle(),
            c.getIncident2().getId(), c.getIncident2().getTitle(),
            c.getCorrelationType(), c.getCreatedBy(), c.getCreatedAt()
        );
    }
}