package com.sip.psm.dto;

import java.util.List;

// Exemple : { "roles": ["ADMIN", "COLLABORATEUR"] }
public record UserRolesRequest(List<String> roles) {
}
