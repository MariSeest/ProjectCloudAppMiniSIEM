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
            // prova prima X-Forwarded-For, poi remote address
            String xff = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                // prendi il primo IP nella lista
                String ip = xff.split(",")[0].trim();
                return Mono.just(ip);
            }

            var addr = exchange.getRequest().getRemoteAddress();
            String ip = (addr != null && addr.getAddress() != null)
                    ? addr.getAddress().getHostAddress()
                    : "unknown";
            return Mono.just(ip);
        };
    }
}