package it.lilsec.backend.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining("; "));

        return ResponseEntity.badRequest().body(
                new ApiError(Instant.now(), 400, "VALIDATION_ERROR", msg)
        );
    }

    @ExceptionHandler(OpenCtiUnavailableException.class)
    public ResponseEntity<ApiError> handleOpenCti(OpenCtiUnavailableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(
                new ApiError(Instant.now(), 502, "OPENCTI_UNAVAILABLE", ex.getMessage())
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        return ResponseEntity.status(500).body(
                new ApiError(Instant.now(), 500, "INTERNAL_ERROR", ex.getMessage())
        );
    }
}
