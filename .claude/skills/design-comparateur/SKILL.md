---
name: design-comparateur
description: Règles de design du comparateur des programmes 2027 (direction « papier éditorial » inspirée d'Emmaüs AGIR 31, Microsoft AI, Terminal Industries, Extrafazant, Agrumea Farm, SEAS Geosciences, Bruno Simon), adaptées à un outil civique strictement neutre. À charger avant toute création ou modification d'interface : page, composant, style, animation, image d'aperçu.
---

# Design du comparateur – règles

Ce site informe une famille (tous âges, surtout sur téléphone) sur les programmes de la présidentielle 2027. Le design doit être **chaleureux, éditorial et calme**, jamais publicitaire, et **strictement neutre** entre candidats. Ces règles complètent `CLAUDE.md` et `docs/PLAN_DESIGN.md` ; en cas de conflit, la neutralité l'emporte toujours.

## 1. Ce que l'on retient des sites de référence

| Site | Retenu | Écarté |
|---|---|---|
| Emmaüs AGIR 31 | fond papier chaud et grain discret ; très grand titre typographique mêlant romain et *italique* ; rangée de chiffres clés « grand nombre + petite légende » ; boutons pleins arrondis | illustration figurative centrale, texte vertical |
| Microsoft AI | serif humaniste pour les titres, beaucoup d'air, en-tête en pilule flottante, tons crème | dégradés animés en plein écran |
| Terminal Industries | barre de navigation flottante et compacte, hiérarchie nette des boutons | photo plein cadre, accent vert acide, libellés en capitales |
| Extrafazant | contraste gras / serif dans un même titre, rythme typographique fort | tout en capitales, couleurs vives de marque |
| Agrumea Farm | palette chaude et sobre, boutons ronds contourés, élégance éditoriale | rotation d'objets 3D, texte en cercle |
| SEAS Geosciences | non analysé (page trop lente à charger lors de la capture) | — |
| Bruno Simon | une seule idée mémorable, bien exécutée | 3D / WebGL (lourd, inaccessible sur mobile) |

Principe : **une seule audace par page** (le titre affiche de l'accueil, le « bulletin » des candidats) ; tout le reste discret.

## 2. Tokens (définis dans `src/styles/global.css`, ne pas en créer d'autres sans raison)

- Fond page `--page` #F7F4EE + `--grain` (bruit SVG à 4,5 % d'opacité) ; surfaces `--surface` #EFEAE1 ; cartes `--white` #FFFDF9 ; filets `--line` #E3DDD2.
- Encre `--ink-900` #111827, `--ink-600` #4B5563 (texte secondaire), `--ink-400` #9CA3AF (désactivé uniquement, jamais pour du texte lisible).
- `--accent` #4338CA (indigo) et `--accent-50` : **interface seulement** (liens, focus, sélection, bouton principal). Jamais pour un candidat, une mesure, un statut.
- Sombre : tons chauds (#151410 / #1C1A16 / #23211C, accent #A5B4FC). Toujours redéfinir via les tokens, jamais de couleur en dur.
- Interdits : couleurs de partis, vert/rouge évaluatifs, ✓/✗, dégradés décoratifs.

## 3. Typographie

- Titres (h1, h2, titres de cartes, chiffres) : **Fraunces Variable** (`--font-display`), graisse 450-500, axe `opsz` élevé, interlettrage négatif léger (−0,015 à −0,035 em), `text-wrap: balance`.
- Texte : **Bricolage Grotesque Variable** (`--font-sans`), **17 px minimum**, interligne 1,6, lignes ≤ 70 caractères (`.prose-w`).
- Échelle : 13 / 15 / 17 / 20 / 24 / 32 px ; titre affiche `clamp(2.6rem, 9vw, 6.5rem)`.
- L'italique de Fraunces sert à **une** seconde ligne de titre (ex. « *sources à l'appui.* »), pas à surligner des mots isolés.
- Chiffres : `tabular-nums` pour les montants et tableaux.
- Pas de libellés en capitales espacées, pas de police monospace décorative, pas de « → » ajouté aux liens.

## 4. Mise en page et composants

- Alignement à gauche ; grille 4 px (4, 8, 12, 16, 24, 32, 48) ; conteneur `max-w-7xl` (pages larges) ou `max-w-3xl` (lecture).
- **En-tête** : pilule flottante (`rounded-full`, fond blanc 85 % + flou, ombre très légère), hauteur 56 px, marge 10 px ; `--header-h` = 4.75rem pour les éléments collants.
- **Accueil affiche** : titre géant → phrase d'intro → rangée de 4 chiffres entre deux filets → 2 boutons ronds → grille de cartes thèmes.
- **Cartes thèmes** (`.carte-theme`) : rayon 14 px, pictogramme Lucide dans un cercle, numéro du thème (les thèmes sont une liste numérotée validée), titre en Fraunces, nombre de propositions ; survol = −2 px + ombre douce.
- **Bulletin candidat** (`Bulletin.astro`, `Monogramme.astro`) : identique pour tous (monogramme gris, nom, parti). Aucune photo, aucun logo, aucune taille ou position privilégiée. Ordre aléatoire par session + « Trier de A à Z ».
- **Cartes mesure** : même composant, même hauteur par ligne, statut en pastille neutre (forme du contour, pas couleur), « Détails » en accordéon `aria-expanded`, « Source ↗ ».
- **Boutons** : 44 px de haut minimum ; principal plein indigo arrondi ; secondaire contour ; fantôme sans fond.
- Rayons : 8 px (cartes mesure), 14 px (cartes thèmes), 999 px (pilules, puces, boutons d'accueil).
- Ombres : quasi nulles ; une ombre douce seulement au survol ou sous la barre flottante.

## 5. Mouvement

- **Une seule** animation non déclenchée par l'utilisateur : l'arrivée de l'accueil (`.arrivee`, fondu + 14 px, 600 ms, décalages 120/260/400 ms).
- Les autres transitions répondent à une action (accordéon, survol, sélection), 150 ms maximum.
- `prefers-reduced-motion` coupe tout (règle globale déjà en place).
- Interdits : parallaxe, défilement détourné, 3D, curseur personnalisé, vidéo en fond.

## 6. Accessibilité et performance (critères d'acceptation)

- Contrastes AA : vérifier avec axe-core (Playwright) en clair **et** en sombre, à 375 px et 1440 px, après la fin des animations (attendre ≥ 1,5 s).
- Navigation clavier complète, focus visible (contour indigo 2 px).
- Polices auto-hébergées (`@fontsource-variable/*`), uniquement les sous-ensembles latins ; aucun CDN de polices.
- Images en SVG ; pictogrammes Lucide inlinés au build (`Icone.astro`) ; pas de librairie JS lourde.
- Tester à 375 px : rien ne déborde horizontalement, comparaison utilisable à une main.

## 7. Rédaction

- Phrases courtes, verbes simples, ton descriptif. Boutons à l'infinitif ou à l'impératif qui disent ce qui se passe (« Choisir un thème », « Partager cette comparaison »).
- Messages vides ou d'erreur : dire quoi faire (« Sélectionnez au moins un candidat… »).
- Jamais d'adjectif évaluatif sur un candidat ou une mesure.

## 8. Vérification avant de livrer une modification visuelle

1. `npm run build` sans erreur.
2. Captures Playwright : accueil, une fiche thème (section Propositions), une page candidat ; 375 px et 1440 px ; clair et sombre.
3. axe-core sans violation WCAG 2 A/AA.
4. Relecture neutralité : aucun candidat distingué par couleur, taille, position ou image.
