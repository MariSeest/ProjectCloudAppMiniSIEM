package it.lilsec.backend.opencti;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class OpenCtiClient {

    private final WebClient webClient;

    public OpenCtiClient(
            @Value("${opencti.url}") String url,
            @Value("${opencti.token}") String token
    ) {
        this.webClient = WebClient.builder()
                .baseUrl(url)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public Mono<String> query(String query, Map<String, Object> variables) {
        Map<String, Object> payload = Map.of("query", query, "variables", variables);
        return webClient.post().bodyValue(payload).retrieve().bodyToMono(String.class);
    }
}
