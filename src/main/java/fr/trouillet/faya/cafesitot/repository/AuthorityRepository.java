package fr.trouillet.faya.cafesitot.repository;

import fr.trouillet.faya.cafesitot.domain.Authority;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for the Authority entity.
 */
public interface AuthorityRepository extends JpaRepository<Authority, String> {
}
