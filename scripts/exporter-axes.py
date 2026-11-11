#!/usr/bin/env python3
"""Exporte les axes de tous les thèmes dans docs/recherche/axes.json (utilisé par les consignes de recherche)."""
import json, pathlib, yaml
R = pathlib.Path(__file__).resolve().parent.parent
axes = {f.stem: {a['id']: a['libelle'] for a in yaml.safe_load(f.read_text()).get('axes', [])} for f in sorted((R / 'src/content/themes').glob('*.yaml'))}
(R / 'docs/recherche/axes.json').write_text(json.dumps(axes, ensure_ascii=False, indent=1))
print(sum(len(v) for v in axes.values()), 'axes exportés')
