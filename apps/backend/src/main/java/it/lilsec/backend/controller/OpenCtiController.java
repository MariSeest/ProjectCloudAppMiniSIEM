package it.lilsec.backend.controller;

import it.lilsec.backend.opencti.OpenCtiClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/opencti")
public class OpenCtiController {

    private final OpenCtiClient client;

    public OpenCtiController(OpenCtiClient client) {
        this.client = client;
    }

    @GetMapping("/ping")
    public String ping() {
        String q = "query { __typename }";
        return client.query(q, Map.of()).block();
    }
}
