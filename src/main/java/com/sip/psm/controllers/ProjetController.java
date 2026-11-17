package com.sip.psm.controllers;

import com.sip.psm.dto.FichierContenu;
import com.sip.psm.dto.ProjetRequest;
import com.sip.psm.entities.Projet;
import com.sip.psm.services.ProjetService;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

import java.util.List;

@RestController
@RequestMapping("/api/projets")
public class ProjetController {

    private final ProjetService projetService;

    public ProjetController(ProjetService projetService) {
        this.projetService = projetService;
    }

    @GetMapping
    public List<Projet> getAll() {
        return projetService.findAll();
    }

    @GetMapping("/{id}")
    public Projet getById(@PathVariable Long id) {
        return projetService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Projet> create(@Valid @RequestBody ProjetRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projetService.save(req));
    }

    @PutMapping("/{id}")
    public Projet update(@PathVariable Long id, @Valid @RequestBody ProjetRequest req) {
        return projetService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projetService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ===================== Cahier des charges (PDF) =====================

    @PostMapping(value = "/{id}/cahier-charges", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Projet uploadCahierCharges(@PathVariable Long id, @RequestParam("file") MultipartFile file,
                                      Authentication auth) {
        return projetService.setCahierCharges(id, file, AuthUtils.isAdmin(auth));
    }

    // Renvoie le PDF ("inline" : le navigateur l'affiche au lieu de le télécharger)
    @GetMapping("/{id}/cahier-charges")
    public ResponseEntity<byte[]> getCahierCharges(@PathVariable Long id) {
        FichierContenu pdf = projetService.getCahierCharges(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(pdf.nom(), StandardCharsets.UTF_8).build().toString())
                .body(pdf.donnees());
    }

    @DeleteMapping("/{id}/cahier-charges")
    public Projet deleteCahierCharges(@PathVariable Long id) {
        return projetService.deleteCahierCharges(id);
    }
}
