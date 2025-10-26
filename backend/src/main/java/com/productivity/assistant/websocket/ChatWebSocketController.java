package com.productivity.assistant.websocket;

import com.productivity.assistant.ai.AIService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class ChatWebSocketController {
    
    @Autowired
    private AIService aiService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    private final ConcurrentHashMap<String, List<String>> userConversations = new ConcurrentHashMap<>();
    
    @MessageMapping("/chat.send")
    @SendToUser("/queue/chat")
    public ChatResponse handleChatMessage(ChatMessage message, Principal principal) {
        String username = principal.getName();
        
        List<String> history = userConversations.computeIfAbsent(username, k -> new ArrayList<>());
        
        history.add("User: " + message.getContent());
        
        String aiResponse = aiService.chatWithAssistant(message.getContent(), history);
        
        history.add("Assistant: " + aiResponse);
        
        if (history.size() > 20) {
            history.subList(0, history.size() - 20).clear();
        }
        
        ChatResponse response = new ChatResponse();
        response.setContent(aiResponse);
        response.setSender("AI Assistant");
        response.setTimestamp(LocalDateTime.now());
        response.setType(ChatResponse.MessageType.CHAT);
        
        return response;
    }
    
    @MessageMapping("/chat.clear")
    @SendToUser("/queue/chat")
    public ChatResponse clearHistory(Principal principal) {
        String username = principal.getName();
        userConversations.remove(username);
        
        ChatResponse response = new ChatResponse();
        response.setContent("Conversation history cleared.");
        response.setSender("System");
        response.setTimestamp(LocalDateTime.now());
        response.setType(ChatResponse.MessageType.SYSTEM);
        
        return response;
    }
    
    @Data
    public static class ChatMessage {
        private String content;
        private String sender;
        private LocalDateTime timestamp;
    }
    
    @Data
    public static class ChatResponse {
        private String content;
        private String sender;
        private LocalDateTime timestamp;
        private MessageType type;
        
        public enum MessageType {
            CHAT, SYSTEM, ERROR
        }
    }
}
