#!/usr/bin/env python3
"""Importe le contexte d'un thème (situation, bilan, effets, glossaire, sources, votes) depuis un JSON de recherche.
Usage : python3 scripts/import-theme.py <theme-id> <theme.json> [date_consultation AAAA-MM-JJ]
N'écrase pas un terme de glossaire ou une source déjà présents (même id)."""
import json, sys, datetime, pathlib, yaml
class D(yaml.SafeDumper):
    def ignore_aliases(self, x): return True
dump = lambda o: yaml.dump(o, Dumper=D, allow_unicode=True, sort_keys=False, width=10000)
tid, fichier = sys.argv[1], sys.argv[2]
today = datetime.date.fromisoformat(sys.argv[3]) if len(sys.argv) > 3 else datetime.date.today()
C = pathlib.Path(__file__).resolve().parent.parent / 'src/content'
d = json.load(open(fichier))
iso = lambda s: datetime.date.fromisoformat(s) if s else None
for s in d.get('sources', []):
    f = C / 'sources' / f"{s['id']}.yaml"
    if f.exists(): continue
    o = {'titre': s['titre'], 'organisme': s['organisme']}
    if s.get('date_publication'):
        try: o['date_publication'] = iso(s['date_publication'][:10])
        except ValueError: pass
    o.update({'date_consultation': today, 'url': s['url'], 'type': s.get('type', 'autre')})
    f.write_text(dump(o))
for g in d.get('glossaire', []):
    f = C / 'glossaire' / f"{g['id']}.yaml"
    if f.exists(): continue
    o = {'terme': g['terme'], 'definition': g['definition']}
    if g.get('exemple'): o['exemple'] = g['exemple']
    if g.get('lien_url'): o['lien'] = {'titre': g.get('lien_titre') or g['lien_url'], 'url': g['lien_url']}
    f.write_text(dump(o))
pt = C / 'themes' / f'{tid}.yaml'
t = yaml.safe_load(pt.read_text())
axes = {a['id'] for a in t.get('axes', [])}
t['etat'] = 'publie'; t['date_maj'] = today
t['situation'] = {'texte': d['situation_texte'],
  'chiffres': [{k: v for k, v in {'libelle': c['libelle'], 'valeur': c['valeur'], 'precision': c.get('precision'), 'annee': str(c['annee']), 'source': c['source_id']}.items() if v} for c in d['chiffres']],
  'lois': [{'titre': l['titre'], 'resume': l['resume'], 'url': l['url']} for l in d.get('lois', [])]}
t['bilan'] = [{'nature': b['nature'], 'texte': b['texte'], 'sources': b['source_ids']} for b in d['bilan']]
t['effets'] = [{k: v for k, v in {'sujet': e['sujet'], 'axes': [a for a in e.get('axes', []) if a in axes],
  'evaluations': [{k2: v2 for k2, v2 in {'source': v['source_id'], 'resume': v['resume'], 'fourchette': v.get('fourchette')}.items() if v2} for v in e['evaluations']],
  'desaccords': e.get('desaccords')}.items() if v is not None} for e in d.get('effets', [])]
t['glossaire'] = list(dict.fromkeys(d.get('glossaire_ids') or [g['id'] for g in d.get('glossaire', [])]))
pt.write_text(dump(t))
for v in d.get('votes', []):
    o = {'theme': tid, 'titre': v['titre'], 'objet': v['objet'], 'date': iso(v['date']), 'legislature': v['legislature'],
         'numero_scrutin': v['numero_scrutin'], 'url': v['url'], 'axes': [a for a in v.get('axes', []) if a in axes],
         'resultat': v['resultat'], 'decompte': v['decompte'], 'groupes': v['groupes']}
    if v.get('note'): o['note'] = v['note']
    o['date_consultation'] = today
    fv = C / 'votes' / f"{v['id']}.yaml"
    if fv.exists() and yaml.safe_load(fv.read_text()).get('theme') != tid:
        fv = C / 'votes' / f"{v['id']}--{tid}.yaml"  # même scrutin rattaché à un autre thème
    fv.write_text(dump(o))
print(tid, 'ok :', len(d['chiffres']), 'chiffres,', len(d['bilan']), 'bilan,', len(d.get('effets', [])), 'effets,', len(t['glossaire']), 'termes,', len(d.get('votes', [])), 'votes')
print('A VERIFIER :', *d.get('a_verifier', []), sep='\n - ')
