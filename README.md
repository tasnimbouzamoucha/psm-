# PSM – Projects Manager (Spring Boot + Angular)

Projet complet du cahier des charges **« CDC : Projects Manager »** (SmartSoft Solutions) :
gestion des **clients** et de leurs **projets**, avec **utilisateurs / rôles**, **sécurité JWT**,
**email à l'admin** à chaque inscription et interface **Angular basée sur le template Velzon**.

```
psm-project/
├── psm/                  → Backend Spring Boot (à ouvrir dans STS)
│   └── src/main/resources/static/   → Angular déjà compilé (étape 11)
├── psm-front/            → Frontend Angular 18 + thème Velzon (à ouvrir dans VS Code)
├── postman/              → Collection Postman prête à importer (étapes 3, 6, 7)
└── deploy/               → Fichiers pour le VPS (service systemd, nginx, script)
```

---

## 0. Prérequis

| Outil | Version | Vérifier |
|---|---|---|
| JDK | 17 ou plus | `java -version` |
| STS (Spring Tool Suite) | 4.x | Maven est intégré |
| MySQL | 8 (ou XAMPP / WAMP) | MySQL doit tourner sur le port 3306 |
| Node.js | 18.19+, 20 ou 22 | `node -v` |
| Angular CLI (optionnel) | 18 | `npm i -g @angular/cli@18` |
| Postman | – | pour les tests d'API |

---

## 1. Lancer le projet en 5 minutes

### a) Base de données
Démarre MySQL (XAMPP → *Start* sur MySQL). **Rien à créer** : la base `psm_db` est créée
automatiquement au démarrage.

Si ton MySQL a un mot de passe pour `root`, modifie `psm/src/main/resources/application.properties` :
```properties
spring.datasource.username=root
spring.datasource.password=TON_MOT_DE_PASSE
```
(remplace `${DB_PASSWORD:}` par ton mot de passe, ou laisse vide pour XAMPP).

### b) Backend dans STS
1. `File → Import… → Maven → Existing Maven Projects` → choisis le dossier `psm` → *Finish*.
2. Attends que Maven télécharge les dépendances (barre en bas à droite).
3. Clic droit sur le projet → `Run As → Spring Boot App`.
4. Dans la console tu dois voir :
   ```
   >>> Compte ADMIN créé : admin@psm.com / admin123
   >>> Compte COLLABORATEUR créé : collab@psm.com / collab123
   >>> Données de démonstration créées (3 clients, 4 projets)
   Tomcat started on port 8080
   ```
5. Ouvre **http://localhost:8080** → l'application Angular complète s'affiche (déjà compilée dans `static`).

| Compte | Email | Mot de passe |
|---|---|---|
| Admin | admin@psm.com | admin123 |
| Collaborateur | collab@psm.com | collab123 |

### c) Frontend en mode développement (VS Code)
Pour modifier le code Angular avec rechargement automatique :
```bash
cd psm-front
npm install
npm start          # = ng serve
```
Ouvre **http://localhost:4200** (Spring Boot doit tourner sur 8080).

---

## 2. Correspondance cahier des charges → fichiers

| Étape CDC | Ce qui a été fait | Fichiers principaux |
|---|---|---|
| 1. Projet Spring (web, JPA, devtools, MySQL) | `com.sip` / `psm` / `com.sip.psm`, Java 17 | `psm/pom.xml`, `PsmApplication.java` |
| 2. CRUD des entités | User, Role, Client, Projet + relations | `entities/`, `repositories/`, `services/`, `controllers/` |
| 3. Tests Postman | dossier « 1 - CRUD sans sécurité » | `postman/PSM.postman_collection.json` |
| 4. Security + JWT | filtre JWT, BCrypt, règles par rôle | `security/` |
| 5. Email à l'admin après inscription | Gmail SMTP, envoi asynchrone | `services/EmailService.java` |
| 6. Tests login & register | dossier « 2 - Auth » | collection Postman |
| 7. Tests Clients/Projets sécurisés | dossiers « 3 - ADMIN » et « 4 - COLLABORATEUR » | collection Postman |
| 8. Composants + navbar (Velzon) | Clients, Projets, Users, Dashboard, Login, Register | `psm-front/src/app/pages/`, `layouts/`, `account/` |
| 9. Guard + Interceptor | `authGuard`, `roleGuard`, `jwtInterceptor` | `psm-front/src/app/core/` |
| 10. Gestion des rôles | menu, boutons et routes selon le rôle | `sidebar/menu.ts`, `app.routes.ts`, `*.html` |
| 11. Build `psm.jar` avec Angular dans `static` | `ng build` écrit directement dans `psm/src/main/resources/static` | `psm-front/angular.json`, `SpaWebConfig.java` |
| 12. Déploiement VPS | service systemd + nginx | `deploy/` |

---

## 3. Partie 1 — Spring Boot (détails)

### Modèle (diagramme de classes)
- **User** (id, email, password, tel, nom, prenom) **Many-to-Many** **Role** (id, libelle) → table `user_roles`
- **Client** (id, nom, tel, email, adresse) **One-to-Many** **Projet** (id, libelle, budget, duree, description, id_client)
- Supprimer un client supprime ses projets (`cascade = ALL, orphanRemoval = true`).
- `@JsonIgnore` sur `Client.projets` évite la boucle JSON infinie.

### API REST

| Méthode | URL | ADMIN | COLLABORATEUR |
|---|---|:-:|:-:|
| POST | `/api/auth/register` | public | public |
| POST | `/api/auth/login` | public | public |
| GET | `/api/clients`, `/api/clients/{id}`, `/api/clients/{id}/projets` | ✅ | ✅ |
| POST | `/api/clients` | ✅ | ✅ |
| PUT / DELETE | `/api/clients/{id}` | ✅ | ❌ 403 |
| GET | `/api/projets`, `/api/projets/{id}` | ✅ | ✅ |
| POST | `/api/projets` | ✅ | ✅ |
| PUT / DELETE | `/api/projets/{id}` | ✅ | ❌ 403 |
| GET | `/api/users/me` | ✅ | ✅ |
| GET / PUT / DELETE | `/api/users`, `/api/users/{id}/roles`, `/api/users/{id}` | ✅ | ❌ 403 |
| GET | `/api/roles` | ✅ | ❌ 403 |

Corps JSON d'un projet (avec `idClient` comme dans le CDC) :
```json
{ "libelle": "Portail B2B", "budget": 80000, "duree": 6, "description": "...", "idClient": 1 }
```

### Étapes 2-3 : tester le CRUD **sans** sécurité
Dans `application.properties` :
```properties
app.security.enabled=false
```
Relance l'application, puis dans Postman : `Import` → `postman/PSM.postman_collection.json` →
dossier **« 1 - CRUD sans sécurité »**. Toutes les requêtes passent sans token.

### Étape 4 : sécurité JWT
Remets `app.security.enabled=true`. Fonctionnement :
1. `POST /api/auth/login` vérifie email + mot de passe (BCrypt) et renvoie un **token JWT** (valable 24 h).
2. Chaque requête envoie `Authorization: Bearer <token>`.
3. `JwtAuthFilter` lit le token, charge l'utilisateur et ses rôles (`ROLE_ADMIN`, `ROLE_COLLABORATEUR`).
4. `SecurityConfig` applique les règles du tableau ci-dessus (401 sans token, 403 si rôle insuffisant).

### Étape 5 : email à l'admin
Chaque `POST /api/auth/register` crée un utilisateur **COLLABORATEUR** et envoie un email à
`app.admin.email`. Configuration Gmail :
1. Active la validation en 2 étapes sur ton compte Google.
2. Crée un **mot de passe d'application** : https://myaccount.google.com/apppasswords
3. Dans `application.properties` :
   ```properties
   spring.mail.username=ton.adresse@gmail.com
   spring.mail.password=xxxxxxxxxxxxxxxx      # le mot de passe d'application (16 lettres, sans espaces)
   app.admin.email=adresse.qui.recoit@gmail.com
   ```
Sans configuration, l'inscription fonctionne quand même et la console affiche
`Email NON envoyé : spring.mail.username n'est pas configuré`.

### Étapes 6-7 : tests Postman avec la sécurité
1. Dossier **« 2 - Auth »** : *Login ADMIN* et *Login COLLABORATEUR* enregistrent automatiquement
   `adminToken` et `collabToken` (onglet *Variables* de la collection).
2. Dossier **« 3 - ADMIN »** : tout est autorisé (200 / 201 / 204).
3. Dossier **« 4 - COLLABORATEUR »** : GET et POST passent, PUT / DELETE renvoient **403**.
4. Clic droit sur la collection → *Run collection* pour tout lancer d'un coup (les tests vérifient les codes).

---

## 4. Partie 2 — Angular + Velzon (détails)

Le zip Velzon fourni est en Angular 15, qui ne fonctionne pas avec Node 22. Le front est donc un
projet **Angular 18** (compatible Node 18/20/22) qui reprend **les styles SCSS, polices, icônes et la
mise en page « vertical » de Velzon** (`src/assets/scss`), sans les dizaines de librairies inutiles du template.

```
psm-front/src/app/
├── core/
│   ├── models/          client, projet, user, auth
│   ├── services/        auth, client, projet, user, notification (SweetAlert2)
│   ├── guards/          auth.guard.ts (connecté ?), role.guard.ts (bon rôle ?)
│   └── interceptors/    jwt.interceptor.ts (ajoute le token, gère 401/403)
├── layouts/             layout Velzon : sidebar (menu), topbar (navbar), footer
├── account/             login, register
├── shared/page-title/   titre + fil d'Ariane
└── pages/
    ├── dashboard/       statistiques + derniers projets
    ├── clients/         liste, formulaire (ajout/modif), fiche client avec ses projets
    ├── projets/         liste (recherche + filtre client), formulaire
    ├── users/           liste, modification des rôles, suppression (ADMIN)
    └── acces-refuse/    page 403
```

### Étape 9 : Guard et Interceptor
- `authGuard` : sans token valide → redirection vers `/login?returnUrl=...`.
- `guestGuard` : un utilisateur connecté ne revoit pas `/login`.
- `roleGuard` : la route déclare `data: { roles: ['ADMIN'] }` → sinon `/acces-refuse`.
- `jwtInterceptor` (enregistré dans `app.config.ts`) : ajoute `Authorization: Bearer ...`
  à chaque appel de l'API ; si l'API répond **401** → déconnexion + login ; **403** → page accès refusé.

### Étape 10 : rôles dans l'interface
| | ADMIN | COLLABORATEUR |
|---|:-:|:-:|
| Voir / ajouter clients et projets | ✅ | ✅ |
| Boutons Modifier / Supprimer | ✅ | cachés |
| Routes `/clients/edit/:id`, `/projets/edit/:id` | ✅ | bloquées (roleGuard) |
| Menu et page **Utilisateurs** | ✅ | cachés / bloqués |

### URL de l'API
- `src/environments/environment.ts` (dev) : `http://localhost:8080/api`
- `src/environments/environment.prod.ts` (build) : `/api` (même serveur que Spring Boot)

---

## 5. Partie 3 — Build et déploiement

### Étape 11 : créer `psm.jar` contenant Angular
```bash
# 1) Compiler Angular : la sortie va DIRECTEMENT dans psm/src/main/resources/static
cd psm-front
npm install
npx ng build            # (ou: npm run build)

# 2) Créer le jar
cd ../psm
mvn clean package -DskipTests
```
Dans STS (sans Maven en ligne de commande) : clic droit sur `psm` → `Run As → Maven build…` →
Goals : `clean package -DskipTests` → *Run*.

Résultat : **`psm/target/psm.jar`**. Test local :
```bash
java -jar target/psm.jar
```
→ http://localhost:8080 (Angular + API dans un seul jar). Le rafraîchissement d'une page Angular
(ex. `/clients/3`) fonctionne grâce à `SpaWebConfig.java` qui renvoie `index.html`.

### Étape 12 : déployer sur un VPS (Ubuntu 22.04 / 24.04)
```bash
# --- Sur le VPS (connecté en SSH) ---
sudo apt update
sudo apt install -y openjdk-17-jre-headless mysql-server nginx

# Base de données + utilisateur MySQL
sudo mysql -e "CREATE DATABASE psm_db;
CREATE USER 'psm'@'localhost' IDENTIFIED BY 'MotDePasseMySQL';
GRANT ALL PRIVILEGES ON psm_db.* TO 'psm'@'localhost'; FLUSH PRIVILEGES;"

# Utilisateur système + dossier de l'application
sudo useradd -r -s /bin/false psm
sudo mkdir -p /opt/psm && sudo chown psm:psm /opt/psm
```
```bash
# --- Sur ton PC : envoyer le jar ---
scp psm/target/psm.jar utilisateur@IP_DU_VPS:/tmp/
ssh utilisateur@IP_DU_VPS "sudo mv /tmp/psm.jar /opt/psm/ && sudo chown psm:psm /opt/psm/psm.jar"
```
```bash
# --- Sur le VPS : service systemd ---
sudo nano /etc/systemd/system/psm.service     # colle deploy/psm.service et adapte les variables
sudo systemctl daemon-reload
sudo systemctl enable --now psm
sudo journalctl -u psm -f                     # voir les logs (Ctrl+C pour quitter)

# --- nginx (accès par le port 80) ---
sudo nano /etc/nginx/sites-available/psm      # colle deploy/nginx-psm.conf
sudo ln -s /etc/nginx/sites-available/psm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```
Ouvre **http://IP_DU_VPS**. Pour les mises à jour suivantes : `deploy/deploy.sh utilisateur@IP_DU_VPS`.

> En production, change `JWT_SECRET` (clé Base64 d'au moins 32 octets : `openssl rand -base64 48`)
> et les mots de passe des comptes de démonstration (`app.init.*` dans `application.properties`).

---

## 6. Dépannage

| Problème | Solution |
|---|---|
| `Communications link failure` au démarrage | MySQL n'est pas démarré (XAMPP → Start MySQL) |
| `Access denied for user 'root'` | Mets ton mot de passe MySQL dans `spring.datasource.password` |
| `Port 8080 was already in use` | Arrête l'autre application, ou `server.port=8081` (et adapte `environment.ts`) |
| Angular : « Serveur injoignable » | Spring Boot n'est pas lancé sur le port 8080 |
| Erreur CORS dans la console du navigateur | Angular doit tourner sur `http://localhost:4200` (`app.cors.allowed-origins`) |
| Postman renvoie 401 | Lance d'abord *Login ADMIN* / *Login COLLABORATEUR* (dossier 2) |
| Email non reçu | Vérifie le mot de passe d'application Gmail et regarde la console STS |
| `ng` introuvable | Utilise `npx ng ...` ou `npm i -g @angular/cli@18` |
| Page blanche après `ng build` | Relance `mvn clean package` pour que le jar contienne le nouveau `static` |
