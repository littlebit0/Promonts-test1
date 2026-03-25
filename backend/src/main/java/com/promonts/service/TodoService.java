package com.promonts.service;
import com.promonts.domain.course.Course;
import com.promonts.domain.todo.Todo;
import com.promonts.domain.user.User;
import com.promonts.dto.*;
import com.promonts.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor
public class TodoService {
    private final TodoRepository todoRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    @Transactional
    public TodoResponse createTodo(TodoRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));
        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다"));
        }
        Todo todo = Todo.builder().title(request.getTitle()).description(request.getDescription())
                .dueDate(request.getDueDate()).priority(request.getPriority())
                .user(user).course(course).completed(false).build();
        Todo savedTodo = todoRepository.save(todo);
        return TodoResponse.from(savedTodo);
    }
    @Transactional(readOnly = true)
    public TodoResponse getTodo(Long todoId, String userEmail) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 Todo입니다: " + todoId));
        if (!todo.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("조회할 권한이 없습니다");
        }
        return TodoResponse.from(todo);
    }
    @Transactional(readOnly = true)
    public List<TodoListResponse> getTodos(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));
        return todoRepository.findByUser(user).stream().map(TodoListResponse::from).collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public List<TodoListResponse> getTodosByCompleted(String userEmail, Boolean completed) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));
        return todoRepository.findByUserAndCompleted(user, completed).stream().map(TodoListResponse::from).collect(Collectors.toList());
    }
    @Transactional
    public TodoResponse updateTodo(Long todoId, TodoRequest request, String userEmail) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 Todo입니다: " + todoId));
        if (!todo.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("수정할 권한이 없습니다");
        }
        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다"));
        }
        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setDueDate(request.getDueDate());
        todo.setPriority(request.getPriority());
        todo.setCourse(course);
        return TodoResponse.from(todo);
    }
    @Transactional
    public TodoResponse toggleComplete(Long todoId, String userEmail) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 Todo입니다: " + todoId));
        if (!todo.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("수정할 권한이 없습니다");
        }
        todo.setCompleted(!todo.getCompleted());
        return TodoResponse.from(todo);
    }
    @Transactional
    public void deleteTodo(Long todoId, String userEmail) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 Todo입니다: " + todoId));
        if (!todo.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("삭제할 권한이 없습니다");
        }
        todoRepository.delete(todo);
    }
}
