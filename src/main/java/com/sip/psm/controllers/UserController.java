package com.sip.psm.controllers;

import com.sip.psm.dto.UserRolesRequest;
import com.sip.psm.entities.User;
import com.sip.psm.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Utilisateur connecté (tout rôle)
    @GetMapping("/me")
    public User me(Authentication authentication) {
        return userService.findByEmail(authentication.getName());
    }

    // ---- Admin uniquement (voir SecurityConfig) ----
    @GetMapping
    public List<User> getAll() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PutMapping("/{id}/roles")
    public User updateRoles(@PathVariable Long id, @RequestBody UserRolesRequest req) {
        return userService.updateRoles(id, req.roles());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        userService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
