package com.sip.psm.controllers;

import com.sip.psm.dto.AuthResponse;
import com.sip.psm.dto.LoginRequest;
import com.sip.psm.dto.MessageResponse;
import com.sip.psm.dto.RegisterRequest;
import com.sip.psm.entities.Role;
import com.sip.psm.entities.User;
import com.sip.psm.security.JwtService;
import com.sip.psm.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
                          UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        // lève BadCredentialsException (-> 401) si email/mot de passe faux
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));

        UserDetails principal = (UserDetails) auth.getPrincipal();
        String token = jwtService.generateToken(principal);
        User user = userService.findByEmail(req.email());

        return new AuthResponse(token, "Bearer", user.getId(), user.getEmail(),
                user.getNom(), user.getPrenom(),
                user.getRoles().stream().map(Role::getLibelle).toList());
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest req) {
        userService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("Inscription réussie. L'administrateur a été notifié par email."));
    }
}
