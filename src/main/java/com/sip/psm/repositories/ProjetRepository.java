package com.sip.psm.repositories;

import com.sip.psm.entities.Projet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjetRepository extends JpaRepository<Projet, Long> {
    List<Projet> findByClientId(Long clientId);
}
