/**
 * Mini-syntaxe des textes de contenu :
 *   [[id-terme]]              → terme du glossaire (libellé = terme)
 *   [[libellé|id-terme]]      → terme du glossaire avec libellé libre
 *   [libellé](https://…)      → lien externe
 *   ligne vide                → nouveau paragraphe
 */
export type Segment =
  | { type: 'texte'; valeur: string }
  | { type: 'terme'; id: string; libelle?: string }
  | { type: 'lien'; url: string; libelle: string };

const RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]|\[([^\]]+?)\]\((https?:\/\/[^)\s]+)\)/g;

export function segmenter(s: string): Segment[] {
  const out: Segment[] = [];
  let i = 0;
  for (const m of s.matchAll(RE)) {
    if (m.index! > i) out.push({ type: 'texte', valeur: s.slice(i, m.index) });
    if (m[1] !== undefined) {
      out.push(m[2] ? { type: 'terme', id: m[2].trim(), libelle: m[1].trim() } : { type: 'terme', id: m[1].trim() });
    } else {
      out.push({ type: 'lien', libelle: m[3]!, url: m[4]! });
    }
    i = m.index! + m[0].length;
  }
  if (i < s.length) out.push({ type: 'texte', valeur: s.slice(i) });
  return out;
}

export const paragraphes = (s: string) =>
  s.trim().split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);

/** Texte brut (pour attributs, titres) : retire la syntaxe. */
export const brut = (s: string) =>
  s.replace(/\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g, '$1').replace(/\[([^\]]+?)\]\([^)]+\)/g, '$1');
