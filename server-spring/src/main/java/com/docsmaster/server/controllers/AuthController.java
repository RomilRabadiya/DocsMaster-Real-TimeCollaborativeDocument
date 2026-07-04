package com.docsmaster.server.controllers;

import com.docsmaster.server.models.User;
import com.docsmaster.server.repositories.UserRepository;
import com.docsmaster.server.security.jwt.JwtUtils;
import com.docsmaster.server.security.services.UserDetailsImpl;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "User already exists"));
        }

        // Create new user's account
        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(encoder.encode(registerRequest.getPassword()))
                .build();

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        String jwt = jwtUtils.generateJwtToken(userDetails.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("token", jwt);
        
        Map<String, String> userMap = new HashMap<>();
        userMap.put("id", userDetails.getId());
        userMap.put("name", userDetails.getName());
        userMap.put("email", userDetails.getEmail());
        
        response.put("user", userMap);

        return ResponseEntity.ok(response);
    }
}

@Data
class LoginRequest {
    private String email;
    private String password;
}

@Data
class RegisterRequest {
    private String name;
    private String email;
    private String password;
}
