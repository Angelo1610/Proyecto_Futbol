package ec.edu.espe.master.controller;


import ec.edu.espe.master.dto.request.ChangePasswordRequest;
import ec.edu.espe.master.dto.request.LoginRequest;
import ec.edu.espe.master.dto.response.TokenResponse;
import ec.edu.espe.master.entity.User;
import ec.edu.espe.master.repository.UserRepository;
import ec.edu.espe.master.security.services.UserDetailsImpl;
import ec.edu.espe.master.security.jwt.JwtUtils;
import ec.edu.espe.master.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        List<String> roles = extractRoleNames(user);

        String accessToken = jwtUtils.generateAccessToken(
                userDetails.getId(), userDetails.getUsername(), userDetails.getTokenVersion(), roles);
        String refreshToken = jwtUtils.generateRefreshToken(
                userDetails.getId(), userDetails.getUsername(), userDetails.getTokenVersion(), roles);

        // Actualizar lastLogin (opcional)
        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userService.getUserById(user.getId()))
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(@RequestHeader("Authorization") String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token no encontrado");
        }
        String refreshToken = bearerToken.substring(7);

        if (!jwtUtils.validateToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token inválido o expirado");
        }

        UUID userId = jwtUtils.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Verificar versión del token
        Long tokenVersion = jwtUtils.getTokenVersionFromToken(refreshToken);
        if (user.getTokenVersion() != tokenVersion) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token revocado");
        }

        List<String> roles = extractRoleNames(user);
        String newAccessToken = jwtUtils.generateAccessToken(user.getId(), user.getUsername(), user.getTokenVersion(), roles);
        String newRefreshToken = jwtUtils.generateRefreshToken(user.getId(), user.getUsername(), user.getTokenVersion(), roles);

        return ResponseEntity.ok(TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .user(userService.getUserById(user.getId()))
                .build());
    }

    @PatchMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        userService.changePassword(userDetails.getId(), changePasswordRequest.getCurrentPassword(), changePasswordRequest.getNewPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        // Invalidar todos los tokens incrementando la versión
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    private List<String> extractRoleNames(User user) {
        return user.getUserRoles().stream()
                .filter(ec.edu.espe.master.entity.UserRole::getActive)
                .map(ur -> ur.getRole().getName())
                .toList();
    }
}