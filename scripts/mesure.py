#!/usr/bin/env python3
"""Crée ou met à jour UNE mesure, avec contrôles éditoriaux, puis met à jour la date du thème.

Exemples :
  python3 scripts/mesure.py --theme logement --axe loyers --candidat attal --statut programme \\
     --intitule "Encadrement des loyers prolongé dans les zones tendues" \\
     --url https://exemple.fr/programme --titre "Programme, chapitre Logement, p. 12" \\
     --citation "prolonger l'encadrement des loyers" --verifier
  python3 scripts/mesure.py --theme europe --axe budget --candidat zemmour --statut non-publie

Contrôles : thème, axe et candidat existent ; intitulé ≤ 140 caractères et sans adjectif évaluatif de la liste ;
citation < 15 mots ; source obligatoire sauf « non-publie » ; avec --verifier, la citation doit figurer dans la page.
"""
import argparse, datetime, html, pathlib, re, ssl, sys, unicodedata, urllib.request
import yaml

R = pathlib.Path(__file__).resolve().parent.parent
C = R / 'src/content'
INTERDITS = ['ambitieu', 'irréalis', 'courageu', 'démagog', 'historique', 'massi', 'véritable', 'enfin ', 'juste ', 'injuste',
             'scandal', 'laxis', 'assistanat', 'casse', 'utopi', 'populis', 'extrême', 'radical']

class Q(str): pass
class D(yaml.SafeDumper):
    def ignore_aliases(self, x): return True
D.add_representer(Q, lambda d, s: d.represent_scalar('tag:yaml.org,2002:str', s, style='"'))
norm = lambda s: ' '.join(unicodedata.normalize('NFKC', s).replace('’', "'").lower().split())

def erreur(msg): sys.exit(f'ERREUR : {msg}')

def page(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (comparateur-programmes-2027)'})
    with urllib.request.urlopen(req, timeout=30, context=ssl.create_default_context()) as r: b = r.read()
    if url.lower().endswith('.pdf') or b[:4] == b'%PDF':
        import subprocess, tempfile
        with tempfile.NamedTemporaryFile(suffix='.pdf') as f:
            f.write(b); f.flush()
            return subprocess.run(['pdftotext', '-layout', f.name, '-'], capture_output=True, text=True).stdout
    s = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', b.decode('utf-8', 'ignore'))
    return html.unescape(re.sub(r'(?s)<[^>]+>', ' ', s))

def main():
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    for k in ('theme', 'axe', 'candidat', 'statut'): a.add_argument(f'--{k}', required=True)
    for k in ('intitule', 'detail', 'citation', 'chiffrage', 'url', 'titre', 'contexte'): a.add_argument(f'--{k}')
    a.add_argument('--verifier', action='store_true', help='télécharge la source et vérifie la citation')
    a.add_argument('--date', default=datetime.date.today().isoformat())
    x = a.parse_args()
    date = datetime.date.fromisoformat(x.date)
    ft = C / 'themes' / f'{x.theme}.yaml'
    if not ft.exists(): erreur(f'thème inconnu : {x.theme}')
    t = yaml.safe_load(ft.read_text())
    if x.axe not in [ax['id'] for ax in t.get('axes', [])]: erreur(f"axe inconnu pour {x.theme} : {x.axe} (axes : {', '.join(ax['id'] for ax in t['axes'])})")
    if not (C / 'candidats' / f'{x.candidat}.yaml').exists(): erreur(f'candidat inconnu : {x.candidat}')
    if x.statut not in ('programme', 'orale', 'aucune', 'non-publie'): erreur('statut ∈ programme | orale | aucune | non-publie')
    if x.statut in ('programme', 'orale') and not x.intitule: erreur('intitulé obligatoire')
    if x.statut != 'non-publie' and not (x.url and x.titre): erreur('--url et --titre obligatoires (document consulté)')
    if x.statut == 'orale': print('ATTENTION : la règle du 10/11/2026 exclut les déclarations orales (programmes publiés uniquement).')
    if x.intitule:
        if len(x.intitule) > 140: erreur(f'intitulé trop long ({len(x.intitule)} > 140)')
        bad = [w for w in INTERDITS if w in x.intitule.lower()]
        if bad: erreur(f'intitulé : terme évaluatif ou militant à reformuler ({", ".join(bad)})')
    if x.citation:
        n = len(x.citation.split())
        if n >= 15: erreur(f'citation de {n} mots (moins de 15 exigés)')
        if x.verifier:
            if norm(x.citation) not in norm(page(x.url)): erreur('citation introuvable mot pour mot dans la page source')
            print('Citation vérifiée dans la source.')
    m = {'theme': x.theme, 'axe': x.axe, 'candidat': x.candidat, 'statut': x.statut}
    for cle, val in (('intitule', x.intitule), ('detail', x.detail), ('citation', x.citation), ('chiffrage_annonce', x.chiffrage)):
        if val: m[cle] = Q(val)
    if x.url:
        m['source'] = {'url': x.url, 'titre': Q(x.titre)}
        if x.contexte: m['source']['contexte'] = Q(x.contexte)
        m['source']['date_consultation'] = date
    m['date_maj'] = date
    fm = C / 'mesures' / f'{x.theme}--{x.candidat}--{x.axe}.yaml'
    ancien = fm.read_text() if fm.exists() else None
    fm.write_text(yaml.dump(m, Dumper=D, allow_unicode=True, sort_keys=False, width=10000))
    # date de mise à jour du thème
    txt = ft.read_text()
    ft.write_text(re.sub(r'^date_maj: .*$', f'date_maj: {date.isoformat()}', txt, count=1, flags=re.M))
    print(('Mise à jour' if ancien else 'Création') + f' : {fm.relative_to(R)} ; date du thème → {date}')
    print('Ensuite : npm run build, puis commit « Mise à jour programme <candidat> : <thème> ».')

if __name__ == '__main__':
    main()
