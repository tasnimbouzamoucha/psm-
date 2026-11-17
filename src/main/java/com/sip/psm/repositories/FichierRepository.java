package com.sip.psm.repositories;

import com.sip.psm.entities.Fichier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FichierRepository extends JpaRepository<Fichier, Long> {
}
