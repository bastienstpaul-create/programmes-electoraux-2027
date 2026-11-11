#!/usr/bin/env python3
"""Ajoute à A_VERIFIER.md les points « a_verifier » d'un JSON de thème et des JSON candidats du thème."""
import json, sys, glob, os
tid, dossier = sys.argv[1], sys.argv[2]
lignes = []
f = os.path.join(dossier, f'theme-{tid}.json')
if os.path.exists(f):
    for p in json.load(open(f)).get('a_verifier', []): lignes.append((f'{tid} (contexte)', p))
for f in sorted(glob.glob(os.path.join(dossier, f'{tid}--*.json'))):
    for c in json.load(open(f)):
        for p in c.get('a_verifier', []): lignes.append((f"{tid} / {c['candidat']}", p))
with open('A_VERIFIER.md', 'a') as out:
    for qui, p in lignes:
        p = ' '.join(str(p).split()).replace('|', '/')
        out.write(f"| 2026-11-11 | {qui} | {p[:400]}{'…' if len(p) > 400 else ''} | Ouvert |\n")
print(len(lignes), 'points ajoutés')
