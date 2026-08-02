package ec.edu.espe.master.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
public class JwtUtils {
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.access-token-expiration-ms}")
    private int accessTokenExpiresInMs;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private int refreshTokenExpiresInMs;

    private SecretKey getsecretKey (){
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);

    }

    public String generateAccessToken(UUID userId, String username, Long tokenVersion, List<String> roles) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("username", username)
                .claim("version", tokenVersion)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiresInMs))
                .signWith(getsecretKey())
                .compact();
    };

    public String generateRefreshToken(UUID userId, String username, Long tokenVersion, List<String> roles) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("username", username)
                .claim("version", tokenVersion)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiresInMs))
                .signWith(getsecretKey())
                .compact();
    }

    public UUID getUserIdFromToken(String token) {
        return UUID.fromString(
                Jwts.parser()
                        .verifyWith(getsecretKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload()
                        .getSubject()
        );
    }

    public boolean isTokenExpired(String token) {
        try {
            return parseClaims(token).getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Token inválido: {}", e.getMessage());
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getsecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getTokenVersionFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.get("version", Long.class);
    }

    public String getUsernameFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.get("username", String.class);
    }


}
