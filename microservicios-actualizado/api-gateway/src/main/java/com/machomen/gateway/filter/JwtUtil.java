package com.machomen.gateway.filter;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;
    private Key key;

    @PostConstruct
    public void init() { this.key = Keys.hmacShaKeyFor(secret.getBytes()); }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();
    }

    public boolean isValid(String token) {
        try { getClaims(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }

    public String getSubject(String token) { return getClaims(token).getSubject(); }
    public Integer getRol(String token)    { return getClaims(token).get("rol", Integer.class); }
    public Integer getId(String token)     { return getClaims(token).get("id",  Integer.class); }
}
