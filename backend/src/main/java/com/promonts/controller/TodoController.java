package com.promonts.controller;
import com.promonts.dto.*;
import com.promonts.service.TodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {
    private final TodoService todoService;
    @PostMapping
    public ResponseEntity<TodoResponse> createTodo(
            @RequestBody @Valid TodoRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        TodoResponse response = todoService.createTodo(request, userEmail);
        return ResponseEntity.ok(response);
    }
    @GetMapping
    public ResponseEntity<List<TodoListResponse>> getTodos(
            @RequestParam(required = false) Boolean completed,
            Authentication authentication) {
        String userEmail = authentication.getName();
        if (completed != null) {
            List<TodoListResponse> todos = todoService.getTodosByCompleted(userEmail, completed);
            return ResponseEntity.ok(todos);
        }
        List<TodoListResponse> todos = todoService.getTodos(userEmail);
        return ResponseEntity.ok(todos);
    }
    @GetMapping("/{id}")
    public ResponseEntity<TodoResponse> getTodo(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        TodoResponse todo = todoService.getTodo(id, userEmail);
        return ResponseEntity.ok(todo);
    }
    @PutMapping("/{id}")
    public ResponseEntity<TodoResponse> updateTodo(
            @PathVariable Long id,
            @RequestBody @Valid TodoRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        TodoResponse response = todoService.updateTodo(id, request, userEmail);
        return ResponseEntity.ok(response);
    }
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TodoResponse> toggleComplete(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        TodoResponse response = todoService.toggleComplete(id, userEmail);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        todoService.deleteTodo(id, userEmail);
        return ResponseEntity.noContent().build();
    }
}
