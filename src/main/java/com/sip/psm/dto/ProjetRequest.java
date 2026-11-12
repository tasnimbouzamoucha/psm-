package com.sip.psm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Corps JSON reçu pour créer / modifier un projet (contient idClient comme dans le CDC)
public record ProjetRequest(
        @NotBlank(message = "Le libellé est obligatoire") String libelle,
        Double budget,
        Integer duree,
        String description,
        @NotNull(message = "idClient est obligatoire") Long idClient) {
}
