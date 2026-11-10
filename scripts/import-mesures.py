#!/usr/bin/env python3
"""Convertit un JSON de recherche (format CONSIGNES) en fichiers src/content/mesures/<theme>--<candidat>--<axe>.yaml
Usage : python3 scripts/import-mesures.py <theme-id> <fichier.json> [date_consultation AAAA-MM-JJ]
"""
import json, sys, datetime, pathlib, yaml

class Q(str): pass
class D(yaml.SafeDumper):
    def ignore_aliases(self, data): return True
D.add_representer(Q, lambda d, s: d.represent_scalar('tag:yaml.org,2002:str', s, style='"'))

theme, fichier = sys.argv[1], sys.argv[2]
date = datetime.date.fromisoformat(sys.argv[3]) if len(sys.argv) > 3 else datetime.date.today()
racine = pathlib.Path(__file__).resolve().parent.parent
donnees = json.load(open(fichier))
for cand in donnees:
    cid = cand['candidat']
    for m in cand['mesures']:
        sortie = {'theme': theme, 'axe': m['axe'], 'candidat': cid, 'statut': m['statut']}
        for k in ('intitule', 'detail', 'citation', 'chiffrage_annonce'):
            if m.get(k): sortie[k] = Q(m[k].strip())
        if m.get('source_url') and m['statut'] != 'non-publie' or (m['statut'] == 'non-publie' and m.get('source_url') and m.get('detail')):
            src = {'url': m['source_url'], 'titre': Q(m.get('source_titre') or m['source_url'])}
            if m.get('source_contexte'): src['contexte'] = Q(m['source_contexte'])
            src['date_consultation'] = date
            sortie['source'] = src
        sortie['date_maj'] = date
        f = racine / 'src/content/mesures' / f"{theme}--{cid}--{m['axe']}.yaml"
        f.write_text(yaml.dump(sortie, Dumper=D, allow_unicode=True, sort_keys=False, width=10000))
    print(cid, len(cand['mesures']), 'mesures', '| programme:', cand.get('programme_url'))
