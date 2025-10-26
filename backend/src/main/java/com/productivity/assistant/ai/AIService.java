package com.productivity.assistant.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AIService {
    
    private final ChatClient chatClient;
    
    @Autowired
    public AIService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }
    
    public String summarizeText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }
        
        String promptText = """
            Please provide a concise summary of the following text.
            Keep the summary brief but capture all key points.
            
            Text to summarize:
            %s
            """.formatted(text);
        
        return chatClient.prompt()
                .user(promptText)
                .call()
                .content();
    }
    
    public List<String> generateTasksFromText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        String promptText = """
            Based on the following text, generate a list of actionable tasks.
            Format each task as a clear, concise action item.
            Return the tasks as a numbered list.
            
            Text:
            %s
            """.formatted(text);
        
        String response = chatClient.prompt()
                .user(promptText)
                .call()
                .content();
        
        List<String> tasks = new ArrayList<>();
        String[] lines = response.split("\n");
        for (String line : lines) {
            String cleaned = line.replaceAll("^\\d+\\.\\s*", "").trim();
            if (!cleaned.isEmpty()) {
                tasks.add(cleaned);
            }
        }
        
        return tasks;
    }
    
    public String generateDailySummary(Map<String, Object> userData) {
        int completedTasks = (int) userData.getOrDefault("completedTasks", 0);
        int pendingTasks = (int) userData.getOrDefault("pendingTasks", 0);
        int notesCreated = (int) userData.getOrDefault("notesCreated", 0);
        
        String promptText = """
            Generate a motivational daily productivity summary based on the following data:
            - Completed tasks: %d
            - Pending tasks: %d
            - Notes created: %d
            
            Include:
            1. A brief summary of accomplishments
            2. Encouragement for pending tasks
            3. One productivity tip
            
            Keep it concise and positive.
            """.formatted(completedTasks, pendingTasks, notesCreated);
        
        return chatClient.prompt()
                .user(promptText)
                .call()
                .content();
    }
    
    public String chatWithAssistant(String userMessage, List<String> conversationHistory) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Please provide a message.";
        }
        
        StringBuilder context = new StringBuilder();
        context.append("You are a helpful productivity assistant. ");
        context.append("Help users manage their tasks, notes, and improve productivity.\n\n");
        
        if (conversationHistory != null && !conversationHistory.isEmpty()) {
            context.append("Previous conversation:\n");
            for (String msg : conversationHistory) {
                context.append(msg).append("\n");
            }
            context.append("\n");
        }
        
        context.append("User: ").append(userMessage);
        
        return chatClient.prompt()
                .user(context.toString())
                .call()
                .content();
    }
    
    public String generateInsights(String noteContent, String taskList) {
        String promptText = """
            Based on the user's notes and tasks, provide actionable insights and recommendations.
            
            Notes content:
            %s
            
            Tasks:
            %s
            
            Provide:
            1. Key patterns or themes identified
            2. Priority recommendations
            3. Time management suggestions
            4. Potential blockers to watch out for
            
            Keep the insights practical and actionable.
            """.formatted(noteContent != null ? noteContent : "No notes", 
                         taskList != null ? taskList : "No tasks");
        
        return chatClient.prompt()
                .user(promptText)
                .call()
                .content();
    }
}
