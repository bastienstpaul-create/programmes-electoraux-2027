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
  - `aucune` : programme publié, mais sans proposition sur ce point ;
  - `non-publie` : rien de publié par écrit sur ce point ;
  - `orale` : mesure annoncée oralement (plus utilisé depuis le 10/11/2026) ;
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
  - `candidats/`, `themes/`, `mesures/`, `glossaire/`, `sources/`, `votes/`.
- Recherche : Pagefind (`npm run build` génère l'index).
- Mobile d'abord (lisible à 380 px), tableau comparatif → cartes empilées sur mobile, filtre par candidat. Mode clair/sombre, accessibilité (contrastes AA, navigation clavier).

## Format du contenu (schémas : `src/content.config.ts`)
- Identifiant d'une entrée = nom du fichier sans extension (ex. `themes/travail-retraites.yaml` → `travail-retraites`).
- **Thème** : `axes` = les questions comparées (lignes du tableau). Une mesure cible un `axe` existant du thème.
- **Mesure** : une par couple (thème, axe, candidat). `statut` ∈ `programme | orale | aucune | non-publie`. `source` obligatoire sauf `non-publie` ; `intitule` obligatoire pour `programme`/`orale` ; `contexte` obligatoire pour `orale` ; citation < 15 mots (vérifié au build). Absence de fichier = « Non renseigné » affiché.
- **Textes** : `[[id-terme]]` ou `[[libellé|id-terme]]` → terme du glossaire cliquable (build en échec si l'id n'existe pas) ; `[libellé](https://…)` → lien ; ligne vide → paragraphe.
- **Chiffres, bilans, effets, coûts** : référencent une entrée de `sources/` par son id (build en échec si absente).
- Candidat : `veille_urls` = pages surveillées par `npm run veille` ; `groupes_assemblee` = sigles des groupes de l'Assemblée où siègent les députés de son parti.
- **Votes** (`src/content/votes/`) : un fichier par scrutin et par thème (décompte de tous les groupes, URL assemblee-nationale.fr).
- Design : suivre le skill `.claude/skills/design-comparateur/SKILL.md`.

## Contrôle qualité avant chaque commit de contenu
- [ ] Toutes les mesures ont une source URL et une date de consultation.
- [ ] Aucun chiffre sans source.
- [ ] Même structure remplie pour chaque candidat sur le thème (sinon statut explicite).
- [ ] Relecture neutralité : aucun adjectif évaluatif, aucun titre militant repris, citations < 15 mots.
- [ ] `npm run build` passe sans erreur.
- [ ] `A_VERIFIER.md` mis à jour.

## Mise à jour d'un programme (phase 7)

### Outils
- `npm run veille` : télécharge les pages surveillées (programme, source du statut et `veille_urls` de chaque candidat), compare leur empreinte avec `docs/veille/empreintes.json` et écrit `docs/veille/rapport-AAAA-MM-JJ.md` (pages modifiées, nouvelles, inaccessibles). `npm run veille:tout` ajoute les pages sources de toutes les mesures écrites. Code de sortie 1 s'il y a des pages modifiées.
- `npm run mesure -- --theme <id> --axe <id> --candidat <id> --statut <statut> [--intitule …] [--url … --titre …] [--citation …] [--detail …] [--chiffrage …] [--verifier]` : crée ou remplace une mesure après contrôles (axe existant, intitulé ≤ 140 caractères sans terme évaluatif, citation < 15 mots, source obligatoire sauf `non-publie`) ; `--verifier` télécharge la source et vérifie la citation mot pour mot. Met à jour `date_maj` de la mesure et du thème.
- `scripts/import-mesures.py <theme> <fichier.json>` : import en masse d'un JSON au format de `docs/recherche/CONSIGNES_CANDIDAT.md`.
- `scripts/import-theme.py` / `scripts/publier-theme.sh` : import du contexte d'un thème (situation, bilan, effets, glossaire, sources, votes) au format de `docs/recherche/CONSIGNES_THEME.md`.
- `scripts/exporter-axes.py` : régénère `docs/recherche/axes.json` après modification des axes.

### Procédure
1. **Détecter** : lancer `npm run veille` (chaque semaine, et à chaque annonce de programme dans la presse). Lire le rapport. Une page « modifiée » peut être un simple changement de mise en page : ouvrir la page et comparer.
2. **Vérifier la source** : la mesure doit être écrite dans un document officiel publié (programme, site de campagne, projet du parti). Une interview ou un article de presse ne suffit pas (règle du 10/11/2026). Noter l'URL exacte, le titre et la page/section.
3. **Saisir** :
   - une mesure isolée → `npm run mesure -- … --verifier` ;
   - un programme complet nouvellement publié (ex. Le Pen, Zemmour, Roussel, programme complet d'Attal) → extraction sur les 19 thèmes en suivant `docs/recherche/CONSIGNES_CANDIDAT.md` (un JSON par thème), puis `scripts/import-mesures.py` pour chaque thème ; mettre à jour `programme_url` et `date_verification` du candidat.
   - une mesure retirée du programme → statut `aucune` (programme publié sans proposition sur ce point) avec l'URL consultée.
4. **Nouveau candidat** : créer `src/content/candidats/<id>.yaml` (statut sourcé, `groupes_assemblee`, `veille_urls`), puis une mesure par axe et par thème (au minimum `non-publie`).
5. **Contrôler** : relecture neutralité, `npm run build` (échoue si une règle de schéma n'est pas respectée), `A_VERIFIER.md` mis à jour pour tout doute.
6. **Publier** : commit « Mise à jour programme <candidat> : <thèmes> », push sur la branche de travail, pull request vers `main`, fusion → déploiement Vercel automatique. Mettre à jour les empreintes (`npm run veille`) après intégration.
7. **Textes en cours au Parlement** (listés « À suivre » dans `A_VERIFIER.md`) : après le vote, mettre à jour la situation du thème et ajouter le scrutin dans `src/content/votes/` (décompte par groupe relevé sur la page du scrutin).
