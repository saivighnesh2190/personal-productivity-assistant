package com.productivity.assistant.controller;

import com.productivity.assistant.dto.NoteDto;
import com.productivity.assistant.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5173")
public class NoteController {
    
    @Autowired
    private NoteService noteService;
    
    @PostMapping
    public ResponseEntity<NoteDto> createNote(@Valid @RequestBody NoteDto noteDto, 
                                               Authentication authentication) {
        NoteDto createdNote = noteService.createNote(noteDto, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNote);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<NoteDto> updateNote(@PathVariable Long id,
                                               @Valid @RequestBody NoteDto noteDto,
                                               Authentication authentication) {
        NoteDto updatedNote = noteService.updateNote(id, noteDto, authentication.getName());
        return ResponseEntity.ok(updatedNote);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id,
                                           Authentication authentication) {
        noteService.deleteNote(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<NoteDto> getNoteById(@PathVariable Long id,
                                               Authentication authentication) {
        NoteDto note = noteService.getNoteById(id, authentication.getName());
        return ResponseEntity.ok(note);
    }
    
    @GetMapping
    public ResponseEntity<List<NoteDto>> getUserNotes(@RequestParam(required = false) Boolean archived,
                                                      Authentication authentication) {
        List<NoteDto> notes = noteService.getUserNotes(authentication.getName(), archived);
        return ResponseEntity.ok(notes);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<NoteDto>> searchNotes(@RequestParam String q,
                                                     Authentication authentication) {
        List<NoteDto> notes = noteService.searchNotes(authentication.getName(), q);
        return ResponseEntity.ok(notes);
    }
}
