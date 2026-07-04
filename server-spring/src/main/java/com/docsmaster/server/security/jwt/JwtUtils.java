package com.docsmaster.server.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${app.jwtSecret:mySuperSecretKeyForDocsMasterApplicationNeedToBeLongEnough}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs:3600000}") // 1 hour
    private int jwtExpirationMs;

    public String generateJwtToken(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("id", userId) // Added to match Node.js payload { id: user._id }
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String getUserIdFromJwtToken(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody();
        return claims.get("id", String.class) != null ? claims.get("id", String.class) : claims.getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        }
        return false;
    }
}
