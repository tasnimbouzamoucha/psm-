package com.sip.psm.dto;

// Contenu d'un fichier renvoyé au navigateur (image ou PDF)
public record FichierContenu(String nom, String contentType, byte[] donnees) {
}
