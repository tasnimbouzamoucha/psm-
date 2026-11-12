package com.sip.psm.services;

import com.sip.psm.config.ResourceNotFoundException;
import com.sip.psm.dto.ProjetRequest;
import com.sip.psm.entities.Projet;
import com.sip.psm.repositories.ProjetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjetService {

    private final ProjetRepository projetRepository;
    private final ClientService clientService;

    public ProjetService(ProjetRepository projetRepository, ClientService clientService) {
        this.projetRepository = projetRepository;
        this.clientService = clientService;
    }

    public List<Projet> findAll() {
        return projetRepository.findAll();
    }

    public List<Projet> findByClient(Long clientId) {
        clientService.findById(clientId); // 404 si le client n'existe pas
        return projetRepository.findByClientId(clientId);
    }

    public Projet findById(Long id) {
        return projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec l'id " + id));
    }

    public Projet save(ProjetRequest req) {
        Projet projet = new Projet();
        apply(projet, req);
        return projetRepository.save(projet);
    }

    public Projet update(Long id, ProjetRequest req) {
        Projet projet = findById(id);
        apply(projet, req);
        return projetRepository.save(projet);
    }

    public void delete(Long id) {
        projetRepository.delete(findById(id));
    }

    private void apply(Projet projet, ProjetRequest req) {
        projet.setLibelle(req.libelle());
        projet.setBudget(req.budget());
        projet.setDuree(req.duree());
        projet.setDescription(req.description());
        projet.setClient(clientService.findById(req.idClient()));
    }
}
