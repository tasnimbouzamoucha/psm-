package com.sip.psm.controllers;

import org.springframework.security.core.Authentication;

// Petit utilitaire : l'utilisateur connecté est-il ADMIN ?
final class AuthUtils {

    private AuthUtils() {}

    static boolean isAdmin(Authentication auth) {
        if (auth == null) {
            return true; // sécurité désactivée (app.security.enabled=false) : tout est permis
        }
        return auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
