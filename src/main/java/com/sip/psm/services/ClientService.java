package com.sip.psm.services;

import com.sip.psm.config.ResourceNotFoundException;
import com.sip.psm.entities.Client;
import com.sip.psm.repositories.ClientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
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
}
