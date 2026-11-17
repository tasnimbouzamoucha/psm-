package com.sip.psm.services;

import com.sip.psm.entities.Fichier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

// Vérifie et prépare les fichiers envoyés (images de logo, PDF de cahier des charges)
@Service
public class FichierService {

    private static final long MAX_IMAGE = 2L * 1024 * 1024;  // 2 Mo
    private static final long MAX_PDF = 5L * 1024 * 1024;    // 5 Mo

    // Types d'images acceptés (le SVG est refusé : il peut contenir du code)
    private static final Map<String, String> IMAGES = Map.of(
            "image/png", "png",
            "image/jpeg", "jpg",
            "image/gif", "gif",
            "image/webp", "webp");

    public Fichier creerImage(MultipartFile file) {
        byte[] data = lire(file, MAX_IMAGE, "L'image ne doit pas dépasser 2 Mo");
        String type = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!IMAGES.containsKey(type) || !estUneImage(data)) {
            throw new IllegalArgumentException("Format d'image non supporté (PNG, JPG, GIF ou WEBP uniquement)");
        }
        return new Fichier(nettoyerNom(file.getOriginalFilename(), "logo." + IMAGES.get(type)), type, data);
    }

    public Fichier creerPdf(MultipartFile file) {
        byte[] data = lire(file, MAX_PDF, "Le PDF ne doit pas dépasser 5 Mo");
        // un vrai PDF commence toujours par "%PDF"
        if (data.length < 4 || data[0] != '%' || data[1] != 'P' || data[2] != 'D' || data[3] != 'F') {
            throw new IllegalArgumentException("Le fichier doit être un PDF");
        }
        return new Fichier(nettoyerNom(file.getOriginalFilename(), "cahier-des-charges.pdf"), "application/pdf", data);
    }

    private byte[] lire(MultipartFile file, long max, String messageTropGros) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Aucun fichier reçu");
        }
        if (file.getSize() > max) {
            throw new IllegalArgumentException(messageTropGros);
        }
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new IllegalArgumentException("Impossible de lire le fichier");
        }
    }

    // Vérifie la "signature" binaire du fichier (et pas seulement son extension)
    private boolean estUneImage(byte[] d) {
        if (d.length < 12) return false;
        boolean png = (d[0] & 0xFF) == 0x89 && d[1] == 'P' && d[2] == 'N' && d[3] == 'G';
        boolean jpg = (d[0] & 0xFF) == 0xFF && (d[1] & 0xFF) == 0xD8 && (d[2] & 0xFF) == 0xFF;
        boolean gif = d[0] == 'G' && d[1] == 'I' && d[2] == 'F';
        boolean webp = d[0] == 'R' && d[1] == 'I' && d[2] == 'F' && d[3] == 'F'
                && d[8] == 'W' && d[9] == 'E' && d[10] == 'B' && d[11] == 'P';
        return png || jpg || gif || webp;
    }

    // Garde seulement le nom du fichier (sans chemin) et limite sa longueur
    private String nettoyerNom(String original, String defaut) {
        if (original == null || original.isBlank()) return defaut;
        String nom = original.replace('\\', '/');
        nom = nom.substring(nom.lastIndexOf('/') + 1).replaceAll("[\\r\\n\"]", "_").trim();
        if (nom.isEmpty()) return defaut;
        return nom.length() > 150 ? nom.substring(nom.length() - 150) : nom;
    }
}
