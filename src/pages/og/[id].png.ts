/**
 * Images Open Graph (1200×630) générées au build : sobre, nom du thème et nombre
 * de candidats, aucun candidat mis en avant.
 */
import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getThemes, getCandidats } from '../../lib/data';

const require = createRequire(import.meta.url);
const police = (w: number) => readFileSync(require.resolve(`@fontsource/inter/files/inter-latin-${w}-normal.woff`));

export async function getStaticPaths() {
  const themes = await getThemes();
  return [{ params: { id: 'accueil' } }, ...themes.map((t) => ({ params: { id: t.id } }))];
}

const h = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ params }) => {
  const themes = await getThemes();
  const n = (await getCandidats()).length;
  const theme = themes.find((t) => t.id === params.id);
  const titre = theme ? theme.data.titre : 'Les programmes, thème par thème';
  const sous = theme ? 'Comparez les propositions' : 'Comparez les propositions des candidats';
  // Rangée de bulletins identiques : un par candidat, sans nom
  const bulletins = h('div', { display: 'flex', gap: 14 }, Array.from({ length: n }, () =>
    h('div', { width: 46, height: 64, borderRadius: 6, background: '#ffffff', border: '2px solid #E5E7EB' })));

  const svg = await satori(
    h('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: '#F9FAFB', fontFamily: 'Inter', color: '#111827' }, [
      h('div', { display: 'flex', fontSize: 30, color: '#4B5563' }, 'Présidentielle 2027'),
      h('div', { display: 'flex', flexDirection: 'column', gap: 18 }, [
        h('div', { display: 'flex', fontSize: titre.length > 28 ? 64 : 80, fontWeight: 600, lineHeight: 1.1 }, titre),
        h('div', { display: 'flex', fontSize: 36, color: '#4B5563' }, `${sous} de ${n} candidats, avec leurs sources.`),
      ]),
      bulletins,
    ]) as never,
    { width: 1200, height: 630, fonts: [{ name: 'Inter', data: police(400), weight: 400 }, { name: 'Inter', data: police(600), weight: 600 }] },
  );
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
