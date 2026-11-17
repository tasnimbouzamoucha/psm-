package com.sip.psm.services;

import com.sip.psm.config.ForbiddenException;
import com.sip.psm.config.ResourceNotFoundException;
import com.sip.psm.dto.FichierContenu;
import com.sip.psm.dto.ProjetRequest;
import com.sip.psm.entities.Fichier;
import com.sip.psm.entities.Projet;
import com.sip.psm.repositories.ProjetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ProjetService {

    private final ProjetRepository projetRepository;
    private final ClientService clientService;
    private final FichierService fichierService;

    public ProjetService(ProjetRepository projetRepository, ClientService clientService,
                         FichierService fichierService) {
        this.projetRepository = projetRepository;
        this.clientService = clientService;
        this.fichierService = fichierService;
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

    // ===================== Cahier des charges (PDF) =====================

    // Ajoute ou remplace le PDF. Remplacer un PDF existant = modification -> ADMIN uniquement.
    @Transactional
    public Projet setCahierCharges(Long id, MultipartFile file, boolean isAdmin) {
        Projet projet = findById(id);
        if (projet.getCahierCharges() != null && !isAdmin) {
            throw new ForbiddenException("Seul un administrateur peut remplacer le cahier des charges");
        }
        Fichier pdf = fichierService.creerPdf(file);
        projet.setCahierCharges(pdf); // l'ancien PDF est supprimé (orphanRemoval)
        projet.setCahierChargesNom(pdf.getNom());
        return projetRepository.save(projet);
    }

    @Transactional(readOnly = true)
    public FichierContenu getCahierCharges(Long id) {
        Fichier pdf = findById(id).getCahierCharges();
        if (pdf == null) {
            throw new ResourceNotFoundException("Ce projet n'a pas de cahier des charges");
        }
        return new FichierContenu(pdf.getNom(), pdf.getContentType(), pdf.getDonnees());
    }

    @Transactional
    public Projet deleteCahierCharges(Long id) {
        Projet projet = findById(id);
        projet.setCahierCharges(null);
        projet.setCahierChargesNom(null);
        return projetRepository.save(projet);
    }

    private void apply(Projet projet, ProjetRequest req) {
        projet.setLibelle(req.libelle());
        projet.setBudget(req.budget());
        projet.setDuree(req.duree());
        projet.setDescription(req.description());
        projet.setClient(clientService.findById(req.idClient()));
    }
}
