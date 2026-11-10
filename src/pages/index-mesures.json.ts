/** Index de recherche des mesures (généré au build). */
import type { APIRoute } from 'astro';
import { getThemes, getCandidats, getMesures, nomComplet } from '../lib/data';
import { brut } from '../lib/texte';

export const GET: APIRoute = async () => {
  const themes = await getThemes();
  const candidats = await getCandidats();
  const mesures = (await getMesures()).filter((m) => m.data.statut === 'programme' || m.data.statut === 'orale');
  const nom = new Map(candidats.map((c) => [c.id, nomComplet(c)]));
  const data = {
    themes: themes.map((t) => ({ id: t.id, titre: t.data.titre, axes: Object.fromEntries(t.data.axes.map((a) => [a.id, a.libelle])) })),
    candidats: candidats.map((c) => ({ id: c.id, nom: nom.get(c.id) })),
    mesures: mesures.map((m) => ({
      t: m.data.theme.id, a: m.data.axe, c: m.data.candidat.id, s: m.data.statut,
      i: brut(m.data.intitule ?? ''), d: brut(m.data.detail ?? ''), q: m.data.citation ?? '',
    })),
  };
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};
