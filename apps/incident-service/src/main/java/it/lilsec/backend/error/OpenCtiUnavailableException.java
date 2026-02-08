package it.lilsec.backend.error;

public class OpenCtiUnavailableException extends RuntimeException {
    public OpenCtiUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
    public OpenCtiUnavailableException(String message) {
        super(message);
    }
}
