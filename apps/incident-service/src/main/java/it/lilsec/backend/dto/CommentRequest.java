package it.lilsec.backend.dto;

public record CommentRequest(
    String authorUsername,
    String authorName,
    String content
) {}