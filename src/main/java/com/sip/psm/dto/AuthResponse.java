package com.sip.psm.dto;

import java.util.List;

// Réponse renvoyée après un login réussi
public record AuthResponse(
        String token,
        String type,
        Long id,
        String email,
        String nom,
        String prenom,
        List<String> roles) {
}
