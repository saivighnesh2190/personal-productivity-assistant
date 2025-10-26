package com.productivity.assistant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String email;
    
    public AuthResponse(String accessToken, Long userId, String username, String email) {
        this.accessToken = accessToken;
        this.userId = userId;
        this.username = username;
        this.email = email;
    }
}
