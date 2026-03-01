package it.lilsec.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimitConfig {

    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> {

            // se esiste X-Forwarded-For (ingress / proxy)
            String forwarded = exchange.getRequest()
                    .getHeaders()
                    .getFirst("X-Forwarded-For");

            if (forwarded != null && !forwarded.isEmpty()) {
                return Mono.just(forwarded.split(",")[0].trim());
            }

            // fallback: IP diretto
            var remoteAddress = exchange.getRequest().getRemoteAddress();

            if (remoteAddress != null && remoteAddress.getAddress() != null) {
                return Mono.just(remoteAddress.getAddress().getHostAddress());
            }

            return Mono.just("unknown");
        };
    }
}