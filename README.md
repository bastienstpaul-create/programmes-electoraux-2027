# Comparateur des programmes – Présidentielle 2027

Site pédagogique et strictement neutre qui compare, thème par thème, les mesures des candidats à l'élection présidentielle française de 2027.

## Stack

- [Astro](https://astro.build) (site statique) + TypeScript
- Tailwind CSS v4
- Contenu en YAML/JSON dans `src/content/`, validé par des schémas Zod (content collections)
- Recherche plein texte : [Pagefind](https://pagefind.app) (index généré après le build)
- Déploiement : Vercel (déploiement automatique sur `main`)

## Démarrer

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # vérification TypeScript + build + index Pagefind
npm run preview   # sert dist/ (la recherche ne fonctionne qu'après build)
```

## Organisation

```
src/
  content/
    candidats/   une fiche par candidat
    themes/      une fiche par thème (situation, bilan, effets, sources)
    mesures/     une mesure = thème × candidat
    glossaire/   un terme par fichier
    sources/     registre des sources
  components/    composants réutilisables
  layouts/       gabarits de page
  pages/         routes du site
```

Mettre à jour le contenu ne nécessite jamais de modifier le code : on édite uniquement les fichiers de `src/content/`.

## Règles éditoriales

Voir `CLAUDE.md` (neutralité, sourçage, statuts des mesures) et `A_VERIFIER.md` (points en attente de vérification).
