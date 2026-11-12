package com.sip.psm.controllers;

import com.sip.psm.dto.ProjetRequest;
import com.sip.psm.entities.Projet;
import com.sip.psm.services.ProjetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
