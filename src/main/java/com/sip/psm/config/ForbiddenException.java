package com.sip.psm.config;

// Levée quand l'utilisateur n'a pas le droit d'effectuer l'action (-> 403)
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
