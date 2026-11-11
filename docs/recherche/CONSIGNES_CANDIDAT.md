# Phase 6 – extraction des mesures d'UN programme publié, pour 18 thèmes

Date du jour : 10 novembre 2026. Présidentielle française, 1er tour le 18 avril 2027.

## Règle centrale : programmes ÉCRITS ET PUBLIÉS uniquement
- Seules comptent les mesures écrites dans le programme / site de campagne / projet officiel du parti indiqué. AUCUNE déclaration orale, aucune interview, aucun article de presse comme source d'une mesure.
- Ne JAMAIS inventer une mesure, un chiffre, une citation ou une URL. Chaque élément vient d'une page/PDF effectivement ouvert (curl ou WebFetch). Citations copiées MOT POUR MOT, MOINS DE 15 MOTS (un nombre comme « 1 600 » compte pour 2 mots).
- Neutralité : intitulé descriptif en phrase nominale (« SMIC porté à 1 600 € net en deux ans »), 140 caractères max, aucun adjectif évaluatif, pas de slogan ni de vocabulaire militant repris (« Macron », « casse », « assistanat »… restent dans la citation seulement).
- Statuts : "programme" (mesure écrite trouvée) ; "aucune" (le document publié couvre le domaine du thème ou est un programme complet, mais ne dit rien sur cet axe) ; "non-publie" (le document ne traite pas du tout de ce domaine et le candidat n'a rien publié d'autre).
- Pour "aucune", donner l'URL du document consulté. Pour "non-publie", pas de source.
- Une seule entrée par axe : la mesure principale ; les mesures secondaires vont dans "detail" (1 à 3 phrases factuelles).
- "chiffrage_annonce" uniquement si le document lui-même chiffre la mesure.

## Axes
Les 18 thèmes et leurs axes (id → libellé) sont dans axes.json (même dossier). Respecter exactement les id.

## Sortie
Un fichier JSON par thème : <dossier>/p6/<theme-id>--<candidat>.json, contenant :
[{"candidat":"<id>","programme_url":"…","programme_note":"…","mesures":[{"axe":"…","statut":"…","intitule":"…","detail":"…","citation":"…","chiffrage_annonce":"…","source_url":"…","source_titre":"titre + chapitre/page","date_source":"AAAA-MM-JJ ou null"}],"a_verifier":["…"]}]
(même format que les fichiers *.json existants du dossier, ex. melenchon-roussel.json). 18 fichiers, un objet candidat chacun, une entrée par axe.
Valide chaque JSON (python3 -m json.tool) et vérifie chaque citation dans le texte téléchargé avant d'écrire.
Réponse finale : un résumé court (nombre de mesures par statut et par thème, points douteux). Pas besoin de recopier les JSON.
