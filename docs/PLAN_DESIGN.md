# Plan design – à valider

Basé sur le brief design. Périmètre : présentation et interactions uniquement, pas de modification des mesures ni des sources.

## Existant (rappel)
- Astro 7 statique + Tailwind v4 ; contenu YAML validé par Zod (`src/content.config.ts`).
- Thème → `axes` (= sous-thèmes, lignes du tableau). Mesure = (thème, axe, candidat), 4 statuts + « Non renseigné ».
- Composants : `TableauComparatif`, `MesureCard`, `FiltreCandidats`, `Terme` (popover natif), `StatutBadge`.
- Pages : accueil, thèmes, thème, candidats, candidat, comparer, glossaire, méthode, recherche (Pagefind).

## Écarts brief ↔ existant, et proposition

| Sujet | Existant | Proposition |
|---|---|---|
| Ordre des candidats | Alphabétique | Aléatoire stable par session (seed `sessionStorage`), bouton « Trier A→Z », mention « Ordre aléatoire ». Rendu serveur en ordre alpha, réordonné en JS (sans JS : alpha). |
| Couleurs | Tailwind slate | Tokens CSS du brief sur `:root` + mode sombre `prefers-color-scheme`. Je garde le bouton clair/sombre (via `data-theme`) : à confirmer. |
| Statuts | Badges « Programme écrit / Annonce orale / Pas de mesure / Programme non publié / Non renseigné » | Conservés (exigence initiale), style neutre identique ; « Pas de mesure » devient « Pas de proposition identifiée sur ce point ». Aucun vert/rouge. |
| Carte mesure | Tout affiché | Résumé (≤ 140 car.) + bouton « Détails » (accordéon `aria-expanded`) : détail, citation, chiffrage « annoncé par le candidat », coût selon évaluateurs, « Source ↗ ». |
| Mobile | Cartes empilées pour tous les candidats + filtre | Chips sticky (2–3 candidats, `role="checkbox"`), cartes empilées par sous-thème dans le même ordre. Pas de carrousel (une seule solution, plus simple). |
| Desktop | Tableau | Grille CSS : 1ʳᵉ colonne sticky à gauche, en-têtes sticky (monogramme + nom), colonnes de largeur égale, scroll horizontal si > 5 candidats. |
| État dans l'URL | `/comparer/<theme>/?c=` | `/themes/<id>/?c=a,b` sur la page thème (lien = même vue). `/comparer/` redirige vers ce format. Le thème reste dans le chemin plutôt qu'en `?theme=` (pages statiques, meilleures prévisualisations OG). |
| Partage | – | Bouton « Partager » : `navigator.share`, sinon copie + toast « Lien copié ». |
| Open Graph | – | Image PNG par thème générée au build (satori + resvg, équivalent statique de `@vercel/og`) : nom du thème + nombre de candidats, aucun candidat. `theme-color` neutre. |
| Recherche | Pagefind (résultats par page) | Recherche maison sur un index JSON des mesures généré au build (petit volume) : résultats groupés par thème, tous les candidats concernés, `<mark>` neutre, suggestions si vide. Pagefind conservé pour les textes longs (situation, glossaire) ou retiré : à trancher. |
| Accueil | Liste des thèmes | Intro du brief, grille de cartes : icône Lucide outline (SVG inline, pas de lib) + titre + nombre de mesures ; lien « Voir par candidat » ; date de mise à jour. |
| Navigation thèmes | – | Onglets horizontaux scrollables (desktop) / select sticky (mobile) + « Thème précédent / suivant ». |
| Vue candidat | Liste | Accordéons par thème, même gabarit pour tous. |
| Header / footer | Liens + menu | Header : nom, Thèmes / Candidats / Méthodologie, recherche. Footer : date de MAJ, Méthodologie, Signaler une erreur, mention d'indépendance. Page « Méthode » renommée « Méthodologie » + date de mise à jour par candidat. |
| États | – | Thème sans données : message explicite. Recherche : chargement (skeleton), vide (suggestions), erreur (« Réessayer »). Le reste est statique, pas de chargement réseau. |
| Typo | 16 px | Corps 17 px, échelle 13/15/17/20/24/32, graisses 400/600, max 70ch, cibles tactiles 44 px. |

## Étapes (un commit chacune)
1. Tokens CSS, typo, header/footer, Méthodologie.
2. Monogramme + chip candidat + ordre aléatoire/alpha (utilitaire partagé).
3. Carte mesure avec accordéon « Détails ».
4. Vue thème : grille desktop sticky + sélecteur mobile 2–3 candidats, état dans l'URL, partage, navigation entre thèmes.
5. Accueil (icônes, compteurs) + vue candidat en accordéons.
6. Recherche groupée par thème.
7. OG images + favicon/theme-color.
8. Contrôle accessibilité (axe-core via Playwright) et Lighthouse mobile ; corrections.

## Questions
1. Garder le bouton clair/sombre en plus du réglage système ?
2. Recherche : remplacer Pagefind par la recherche maison groupée par thème, ou garder les deux ?
3. Le skill `frontend-design` n'est pas installé dans cette session : je suis le brief directement.
