package com.productivity.assistant.controller;

import com.productivity.assistant.dto.AuthResponse;
import com.productivity.assistant.dto.LoginRequest;
import com.productivity.assistant.dto.RegisterRequest;
import com.productivity.assistant.entity.User;
import com.productivity.assistant.repository.UserRepository;
import com.productivity.assistant.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(new AuthResponse(jwt, user.getId(), user.getUsername(), user.getEmail()));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }
        
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }
        
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName());
        
        User savedUser = userRepository.save(user);
        
        String jwt = tokenProvider.generateTokenFromUsername(savedUser.getUsername());
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(jwt, savedUser.getId(), savedUser.getUsername(), savedUser.getEmail()));
    }
    
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            if (tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromToken(jwt);
                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(new AuthResponse(jwt, user.getId(), user.getUsername(), user.getEmail()));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
    }
    
    static class MessageResponse {
        private String message;
        
        public MessageResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}
