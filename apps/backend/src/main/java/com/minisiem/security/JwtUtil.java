package com.minisiem.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Function;

@Component
public class JwtUtil {
    @Value("${jwt.secret}") private String secret;
    @Value("${jwt.expiration}") private long expiration;

    public String generateToken(UserDetails ud, UUID userId, UUID tenantId, String role) {
        Map<String,Object> claims = new HashMap<>();
        claims.put("userId", userId.toString());
        claims.put("tenantId", tenantId != null ? tenantId.toString() : null);
        claims.put("role", role);
        return Jwts.builder().claims(claims).subject(ud.getUsername())
            .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis()+expiration))
            .signWith(getSigningKey()).compact();
    }

    public boolean validateToken(String token, UserDetails ud) {
        return extractUsername(token).equals(ud.getUsername()) && !isExpired(token);
    }

    public String extractUsername(String t) { return extractClaim(t, Claims::getSubject); }
    public UUID extractUserId(String t) { String s=extractAllClaims(t).get("userId",String.class); return s!=null?UUID.fromString(s):null; }
    public UUID extractTenantId(String t) { String s=extractAllClaims(t).get("tenantId",String.class); return s!=null?UUID.fromString(s):null; }
    public String extractRole(String t) { return extractAllClaims(t).get("role",String.class); }

    private boolean isExpired(String t) { return extractClaim(t,Claims::getExpiration).before(new Date()); }
    public <T> T extractClaim(String t, Function<Claims,T> r) { return r.apply(extractAllClaims(t)); }
    private Claims extractAllClaims(String t) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(t).getPayload();
    }
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}