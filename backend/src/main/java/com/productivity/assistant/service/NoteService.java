package com.productivity.assistant.service;

import com.productivity.assistant.dto.NoteDto;
import com.productivity.assistant.entity.Note;
import com.productivity.assistant.entity.User;
import com.productivity.assistant.repository.NoteRepository;
import com.productivity.assistant.repository.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NoteService {
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public NoteDto createNote(NoteDto noteDto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Note note = new Note();
        BeanUtils.copyProperties(noteDto, note, "id", "createdAt", "updatedAt");
        note.setUser(user);
        
        Note savedNote = noteRepository.save(note);
        return convertToDto(savedNote);
    }
    
    public NoteDto updateNote(Long noteId, NoteDto noteDto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this note");
        }
        
        note.setTitle(noteDto.getTitle());
        note.setContent(noteDto.getContent());
        note.setCategory(noteDto.getCategory());
        note.setArchived(noteDto.isArchived());
        note.setAiSummary(noteDto.getAiSummary());
        
        Note updatedNote = noteRepository.save(note);
        return convertToDto(updatedNote);
    }
    
    public void deleteNote(Long noteId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this note");
        }
        
        noteRepository.delete(note);
    }
    
    public NoteDto getNoteById(Long noteId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to view this note");
        }
        
        return convertToDto(note);
    }
    
    public List<NoteDto> getUserNotes(String username, Boolean archived) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<Note> notes;
        if (archived != null) {
            notes = noteRepository.findByUserIdAndArchivedOrderByCreatedAtDesc(user.getId(), archived);
        } else {
            notes = noteRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }
        
        return notes.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<NoteDto> searchNotes(String username, String searchTerm) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<Note> notes = noteRepository.searchNotes(user.getId(), searchTerm);
        
        return notes.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private NoteDto convertToDto(Note note) {
        NoteDto dto = new NoteDto();
        BeanUtils.copyProperties(note, dto);
        return dto;
    }
}
