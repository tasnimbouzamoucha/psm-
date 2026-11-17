package com.sip.psm.services;

import com.sip.psm.config.ForbiddenException;
import com.sip.psm.config.ResourceNotFoundException;
import com.sip.psm.dto.FichierContenu;
import com.sip.psm.entities.Client;
import com.sip.psm.entities.Fichier;
import com.sip.psm.repositories.ClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final FichierService fichierService;

    public ClientService(ClientRepository clientRepository, FichierService fichierService) {
        this.clientRepository = clientRepository;
        this.fichierService = fichierService;
    }

    public List<Client> findAll() {
        return clientRepository.findAll();
    }

    public Client findById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable avec l'id " + id));
    }

    public Client save(Client client) {
        client.setId(null);
        return clientRepository.save(client);
    }

    public Client update(Long id, Client data) {
        Client client = findById(id);
        client.setNom(data.getNom());
        client.setTel(data.getTel());
        client.setEmail(data.getEmail());
        client.setAdresse(data.getAdresse());
        return clientRepository.save(client);
    }

    public void delete(Long id) {
        Client client = findById(id);
        clientRepository.delete(client); // supprime aussi ses projets (cascade)
    }

    // ===================== Logo du client =====================

    // Ajoute ou remplace le logo. Remplacer un logo existant = modification -> ADMIN uniquement.
    @Transactional
    public Client setLogo(Long id, MultipartFile file, boolean isAdmin) {
        Client client = findById(id);
        if (client.getLogo() != null && !isAdmin) {
            throw new ForbiddenException("Seul un administrateur peut remplacer le logo");
        }
        client.setLogo(fichierService.creerImage(file)); // l'ancien logo est supprimé (orphanRemoval)
        return clientRepository.save(client);
    }

    @Transactional(readOnly = true)
    public FichierContenu getLogo(Long id) {
        Fichier logo = findById(id).getLogo();
        if (logo == null) {
            throw new ResourceNotFoundException("Ce client n'a pas de logo");
        }
        return new FichierContenu(logo.getNom(), logo.getContentType(), logo.getDonnees());
    }

    @Transactional
    public Client deleteLogo(Long id) {
        Client client = findById(id);
        client.setLogo(null);
        return clientRepository.save(client);
    }
}
