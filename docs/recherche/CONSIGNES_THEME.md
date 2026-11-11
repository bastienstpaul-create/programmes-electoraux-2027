# Phase 6 – contexte d'un thème (situation, bilan, effets, glossaire, votes)

Site pédagogique et strictement neutre comparant les programmes de la présidentielle française 2027. Date du jour : 10 novembre 2026. Public non spécialiste.

Modèle à suivre : le thème pilote déjà publié, fichier /home/user/programmes-electoraux-2027/src/content/themes/travail-retraites.yaml (structure et niveau de détail), et les votes dans /home/user/programmes-electoraux-2027/src/content/votes/*.yaml. Lis-les d'abord. Les axes du thème sont dans axes.json (même dossier).

Règles absolues :
- Ne JAMAIS inventer un chiffre, une source ou une URL. Chaque élément vient d'une page/PDF effectivement ouvert (WebFetch ou curl ; PDF → curl puis pdftotext, dans <dossier>/pdf/). Note la page ou la section.
- Neutralité : aucun adjectif évaluatif. Quand des évaluateurs de sensibilités différentes divergent, donner les deux positions.
- Sources privilégiées : INSEE, Cour des comptes, HCFP, DREES, DARES, France Stratégie, Banque de France, OFCE, IPP, Institut Montaigne, Fondation iFRAP, Terra Nova, Fondation Jean-Jaurès, OCDE, Commission européenne, ministères, rapports parlementaires, organismes publics spécialisés. Lois : legifrance.gouv.fr, vie-publique.fr, conseil-constitutionnel.fr, assemblee-nationale.fr, senat.fr (legifrance et vie-publique peuvent bloquer : utiliser alors les autres).
- Glossaire : réutiliser les termes existants (liste des fichiers dans /home/user/programmes-electoraux-2027/src/content/glossaire/ : utiliser leur id) ; n'en créer de nouveaux qu'avec un id kebab-case préfixé par rien mais unique (vérifier qu'il n'existe pas). Idem pour les sources (/home/user/programmes-electoraux-2027/src/content/sources/) : réutiliser l'id si la source existe déjà.
- Volume visé : situation 3-4 paragraphes ; 4 à 6 chiffres ; 2 à 4 lois ; 4 à 6 constats de bilan ; 3 à 5 effets chiffrés (uniquement des chiffrages réellement publiés) ; 8 à 12 termes ; 3 à 6 votes de l'Assemblée nationale 2022-2026 sur des textes clés du thème (décompte officiel par groupe relevé sur la page du scrutin assemblee-nationale.fr/dyn/<légis>/scrutins/<n>, tous les groupes).

Sortie : écris <dossier>/p6/theme-<theme-id>.json :
{"situation_texte":"… avec [[id-terme]] ou [[libellé|id-terme]]","chiffres":[{"libelle","valeur","precision","annee","source_id"}],"lois":[{"titre","resume","url"}],"bilan":[{"nature":"fonctionne|ne-fonctionne-pas|debat","texte","source_ids":[]}],"effets":[{"sujet","axes":[ids d'axes du thème],"evaluations":[{"source_id","resume","fourchette"}],"desaccords"}],"glossaire":[{"id","terme","definition","exemple","lien_titre","lien_url"}] (nouveaux termes seulement),"glossaire_ids":[tous les ids utilisés, existants + nouveaux],"sources":[{"id","titre","organisme","date_publication","url","type"}] (nouvelles sources seulement),"votes":[{"id","titre","objet","date","legislature","numero_scrutin","url","axes","resultat":"adopte|rejete","decompte":{"pour","contre","abstention"},"groupes":[{"groupe","sigle","pour","contre","abstention","non_votants"}],"note"}],"a_verifier":[]}
Valide le JSON. Réponse finale : résumé court (volumes, points douteux). Pas besoin de recopier le JSON.
