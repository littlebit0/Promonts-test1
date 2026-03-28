package com.promonts.service;

import com.promonts.domain.tag.Tag;
import com.promonts.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {
    
    private final TagRepository tagRepository;
    
    @Transactional
    public Tag create(String name, String color) {
        if (tagRepository.existsByName(name)) {
            throw new RuntimeException("Tag already exists");
        }
        Tag tag = Tag.builder()
                .name(name)
                .color(color != null ? color : "#3B82F6")
                .build();
        return tagRepository.save(tag);
    }
    
    @Transactional
    public Tag update(Long id, String name, String color) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
        if (name != null && !name.equals(tag.getName())) {
            if (tagRepository.existsByName(name)) {
                throw new RuntimeException("Tag name already exists");
            }
            tag.setName(name);
        }
        if (color != null) {
            tag.setColor(color);
        }
        return tagRepository.save(tag);
    }
    
    @Transactional
    public void delete(Long id) {
        tagRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public List<Tag> getAll() {
        return tagRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Tag getById(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
    }
    
    @Transactional(readOnly = true)
    public Tag getByName(String name) {
        return tagRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
    }
}
