# CLAUDE.md – Comparateur des programmes, présidentielle 2027

Instructions pour toute session (humaine ou IA) qui travaille sur ce dépôt.

## Objectif
Site pédagogique et **strictement neutre** comparant les mesures des candidats à la présidentielle 2027, thème par thème. Public : non spécialistes, lecture surtout sur téléphone.

Chaque thème suit toujours la même grille :
1. **Situation actuelle** : chiffres clés récents, lois et règles en vigueur.
2. **Bilan factuel** : ce que disent les évaluations des politiques existantes (ce qui marche, ce qui ne marche pas, ce qui fait débat).
3. **Mesures des candidats** : tableau comparatif, mesure par mesure.
4. **Effets attendus** : coût, impact chiffré selon les évaluateurs, en fourchettes, avec les points de désaccord entre experts.
5. **Glossaire** : chaque concept, acronyme, règle ou loi expliqué simplement, accessible au clic partout dans le site.

## Règles éditoriales (non négociables)
- **Neutralité** : même grille, même niveau de détail, même ton pour tous les candidats. Aucune note, aucun classement, aucun adjectif évaluatif (« ambitieux », « irréaliste », « courageux », « démagogique », etc.).
- **Intitulés neutres** : ne jamais reprendre les titres ou le vocabulaire militant d'un programme. Reformuler la mesure de façon descriptive ; garder la formulation originale en citation courte (**moins de 15 mots**) avec lien.
- **Programmes publiés uniquement** (décision du 10/11/2026) : seules les mesures écrites dans un programme, un site de campagne ou un projet officiel du parti sont retenues. Les déclarations orales (interviews, meetings, presse) ne sont pas utilisées : en leur absence, statut `non-publie`.
- **Votes à l'Assemblée** : pour chaque thème, rappeler les votes des groupes parlementaires sur les textes clés des dernières années (source : page du scrutin sur assemblee-nationale.fr), sans commentaire.
- **Tout est sourcé** : chaque mesure renvoie à la page ou au document officiel du candidat (URL + date de consultation). Chaque chiffre ou évaluation renvoie à sa source.
- **Sources d'évaluation privilégiées** : INSEE, Cour des comptes, COR, Haut Conseil des finances publiques, DREES, DARES, France Stratégie, Banque de France, OFCE, IPP, Institut Montaigne, Fondation iFRAP, Terra Nova, OCDE, Commission européenne. Quand des évaluateurs de sensibilités différentes divergent, **afficher les deux**.
- **Statuts distincts et visibles** :
  - `aucune-mesure` : pas de mesure sur ce thème ;
  - `non-publie` : programme non encore publié sur ce thème ;
  - `orale` : mesure annoncée oralement (interview, meeting) ;
  - `programme` : mesure écrite dans le programme officiel.
- **Lois et règles** : lien vers Légifrance ou vie-publique.fr quand une loi ou un article est cité.
- **Date de mise à jour** visible sur chaque fiche thème et chaque mesure.
- **Pied de page** : outil d'information indépendant, non affilié à un parti, sources consultables.
- **Ne jamais inventer** une mesure, un chiffre ou une source. En cas de doute : ne rien écrire et consigner le point dans `A_VERIFIER.md`.
- **Couleurs neutres** : ne jamais utiliser les couleurs associées aux partis pour les candidats.

## Thèmes (arborescence validée)
1. Institutions et démocratie · 2. Sécurité, justice, libertés publiques · 3. Immigration et intégration · 4. Finances publiques · 5. Économie, industrie, emploi · 6. Travail et retraites · 7. Protection sociale et pauvreté · 8. Santé et autonomie · 9. Éducation, recherche, jeunesse · 10. Logement · 11. Énergie et climat · 12. Agriculture, alimentation, eau · 13. Transports et territoires · 14. Égalité et discriminations · 15. Numérique et IA · 16. Culture, sport, médias · 17. Europe · 18. Défense et diplomatie · 19. Mer et spatial

## Stack et organisation
- Astro + TypeScript strict + Tailwind CSS v4, site statique, déployé sur Vercel.
- **Contenu séparé du code** : YAML/JSON dans `src/content/`, validés par des schémas Zod. Une mise à jour de contenu ne doit jamais demander de toucher au code.
  - `candidats/`, `themes/`, `mesures/`, `glossaire/`, `sources/`.
- Recherche : Pagefind (`npm run build` génère l'index).
- Mobile d'abord (lisible à 380 px), tableau comparatif → cartes empilées sur mobile, filtre par candidat. Mode clair/sombre, accessibilité (contrastes AA, navigation clavier).

## Format du contenu (schémas : `src/content.config.ts`)
- Identifiant d'une entrée = nom du fichier sans extension (ex. `themes/travail-retraites.yaml` → `travail-retraites`).
- **Thème** : `axes` = les questions comparées (lignes du tableau). Une mesure cible un `axe` existant du thème.
- **Mesure** : une par couple (thème, axe, candidat). `statut` ∈ `programme | orale | aucune | non-publie`. `source` obligatoire sauf `non-publie` ; `intitule` obligatoire pour `programme`/`orale` ; `contexte` obligatoire pour `orale` ; citation < 15 mots (vérifié au build). Absence de fichier = « Non renseigné » affiché.
- **Textes** : `[[id-terme]]` ou `[[libellé|id-terme]]` → terme du glossaire cliquable (build en échec si l'id n'existe pas) ; `[libellé](https://…)` → lien ; ligne vide → paragraphe.
- **Chiffres, bilans, effets, coûts** : référencent une entrée de `sources/` par son id (build en échec si absente).
- Données de démonstration : fichiers `demo-*` et champ `factice: true` (bandeau affiché). À supprimer en phase 4.

## Contrôle qualité avant chaque commit de contenu
- [ ] Toutes les mesures ont une source URL et une date de consultation.
- [ ] Aucun chiffre sans source.
- [ ] Même structure remplie pour chaque candidat sur le thème (sinon statut explicite).
- [ ] Relecture neutralité : aucun adjectif évaluatif, aucun titre militant repris, citations < 15 mots.
- [ ] `npm run build` passe sans erreur.
- [ ] `A_VERIFIER.md` mis à jour.

## Procédure de mise à jour d'un programme
(À compléter en phase 7 : script ou procédure pour intégrer une mesure nouvelle ou modifiée.)
