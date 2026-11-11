#!/usr/bin/env python3
"""Veille des programmes : détecte les pages modifiées, nouvelles ou cassées.

Pages surveillées :
  - par défaut : programme_url, statut_source et veille_urls de chaque candidat
    (+ pages sources des mesures « programme » avec --tout)
Compare une empreinte du texte de chaque page avec docs/veille/empreintes.json,
écrit un rapport docs/veille/rapport-AAAA-MM-JJ.md et met à jour les empreintes.

Usage : python3 scripts/surveiller-sources.py [--tout] [--sans-maj]
"""
import argparse, datetime, hashlib, html, json, pathlib, re, ssl, sys, urllib.request
import yaml

RACINE = pathlib.Path(__file__).resolve().parent.parent
C = RACINE / 'src/content'
DOSSIER = RACINE / 'docs/veille'
UA = 'Mozilla/5.0 (compatible; comparateur-programmes-2027; veille)'

def texte(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'fr'})
    with urllib.request.urlopen(req, timeout=30, context=ssl.create_default_context()) as r:
        brut = r.read()
        type_ = r.headers.get('Content-Type', '')
    if 'pdf' in type_ or url.lower().endswith('.pdf'):
        return hashlib.sha256(brut).hexdigest(), f'PDF {len(brut)} octets'
    s = brut.decode('utf-8', 'ignore')
    s = re.sub(r'(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>', ' ', s)
    s = re.sub(r'(?s)<[^>]+>', ' ', s)
    s = ' '.join(html.unescape(s).split())
    # retire les éléments qui changent à chaque chargement (dates/horodatages, jetons)
    s = re.sub(r'\b\d{1,2}:\d{2}(:\d{2})?\b', '', s)
    return hashlib.sha256(s.encode()).hexdigest(), f'{len(s)} caractères'

def pages(tout):
    p = {}
    for f in sorted((C / 'candidats').glob('*.yaml')):
        c = yaml.safe_load(f.read_text())
        cid = f.stem
        for cle in ('programme_url', 'statut_source'):
            if c.get(cle): p.setdefault(c[cle], set()).add(f'{cid} ({cle})')
        for u in c.get('veille_urls', []) or []:
            p.setdefault(u, set()).add(f'{cid} (veille)')
    if tout:
        for f in sorted((C / 'mesures').glob('*.yaml')):
            m = yaml.safe_load(f.read_text())
            if m.get('statut') == 'programme' and m.get('source'):
                p.setdefault(m['source']['url'].split('#')[0], set()).add(f'{m["candidat"]} (mesures)')
    return p

def main():
    a = argparse.ArgumentParser(); a.add_argument('--tout', action='store_true'); a.add_argument('--sans-maj', action='store_true')
    args = a.parse_args()
    DOSSIER.mkdir(parents=True, exist_ok=True)
    fe = DOSSIER / 'empreintes.json'
    avant = json.loads(fe.read_text()) if fe.exists() else {}
    apres, modif, nouv, err, stable = dict(avant), [], [], [], 0
    for url, qui in sorted(pages(args.tout).items()):
        qui = ', '.join(sorted(qui))
        try:
            h, info = texte(url)
        except Exception as e:  # noqa: BLE001
            err.append((url, qui, str(e)[:120])); continue
        ancien = avant.get(url, {}).get('empreinte')
        apres[url] = {'empreinte': h, 'vu_le': datetime.date.today().isoformat(), 'info': info}
        if ancien is None: nouv.append((url, qui))
        elif ancien != h: modif.append((url, qui))
        else: stable += 1
    j = datetime.date.today().isoformat()
    lignes = [f'# Veille des programmes – {j}', '',
              f'{len(modif)} page(s) modifiée(s), {len(nouv)} nouvelle(s), {len(err)} erreur(s), {stable} inchangée(s).', '']
    if modif:
        lignes += ['## Modifiées depuis la dernière veille (à relire)', ''] + [f'- [{u}]({u}) – {q}' for u, q in modif] + ['']
    if nouv:
        lignes += ['## Nouvelles pages surveillées (empreinte de référence enregistrée)', ''] + [f'- [{u}]({u}) – {q}' for u, q in nouv] + ['']
    if err:
        lignes += ['## Inaccessibles (vérifier à la main)', ''] + [f'- [{u}]({u}) – {q} : {e}' for u, q, e in err] + ['']
    lignes += ['## Que faire', '', 'Pour chaque page modifiée : suivre la procédure « Mise à jour d\'un programme » de CLAUDE.md.']
    (DOSSIER / f'rapport-{j}.md').write_text('\n'.join(lignes) + '\n')
    if not args.sans_maj: fe.write_text(json.dumps(apres, ensure_ascii=False, indent=1, sort_keys=True))
    print('\n'.join(lignes[:3]))
    print(f'Rapport : docs/veille/rapport-{j}.md')
    return 1 if modif else 0

if __name__ == '__main__':
    sys.exit(main())
