package com.sip.psm.controllers;

import com.sip.psm.entities.Client;
import com.sip.psm.entities.Projet;
import com.sip.psm.services.ClientService;
import com.sip.psm.services.ProjetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;
    private final ProjetService projetService;

    public ClientController(ClientService clientService, ProjetService projetService) {
        this.clientService = clientService;
        this.projetService = projetService;
    }

    @GetMapping
    public List<Client> getAll() {
        return clientService.findAll();
    }

    @GetMapping("/{id}")
    public Client getById(@PathVariable Long id) {
        return clientService.findById(id);
    }

    // Projets d'un client
    @GetMapping("/{id}/projets")
    public List<Projet> getProjets(@PathVariable Long id) {
        return projetService.findByClient(id);
    }

    @PostMapping
    public ResponseEntity<Client> create(@Valid @RequestBody Client client) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientService.save(client));
    }

    @PutMapping("/{id}")
    public Client update(@PathVariable Long id, @Valid @RequestBody Client client) {
        return clientService.update(id, client);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
