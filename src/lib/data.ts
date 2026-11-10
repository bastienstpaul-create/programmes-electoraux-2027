import { getCollection, type CollectionEntry } from 'astro:content';

export type Candidat = CollectionEntry<'candidats'>;
export type Theme = CollectionEntry<'themes'>;
export type Mesure = CollectionEntry<'mesures'>;
export type Source = CollectionEntry<'sources'>;
export type Terme = CollectionEntry<'glossaire'>;

const collator = new Intl.Collator('fr', { sensitivity: 'base' });

/** Candidats actifs, ordre alphabétique du nom (ordre neutre). */
export async function getCandidats(): Promise<Candidat[]> {
  const all = await getCollection('candidats', (c) => c.data.actif);
  return all.sort((a, b) => collator.compare(a.data.nom, b.data.nom) || collator.compare(a.data.prenom, b.data.prenom));
}

export async function getThemes(): Promise<Theme[]> {
  return (await getCollection('themes')).sort((a, b) => a.data.numero - b.data.numero);
}

let verifie = false;
/** Toutes les mesures, avec vérifications de cohérence (axe existant, doublons). */
export async function getMesures(): Promise<Mesure[]> {
  const mesures = await getCollection('mesures');
  if (!verifie) {
    const themes = new Map((await getCollection('themes')).map((t) => [t.id, t]));
    const vus = new Set<string>();
    for (const m of mesures) {
      const t = themes.get(m.data.theme.id);
      if (!t) throw new Error(`Mesure ${m.id} : thème inconnu « ${m.data.theme.id} »`);
      if (!t.data.axes.some((a) => a.id === m.data.axe)) {
        throw new Error(`Mesure ${m.id} : axe « ${m.data.axe} » absent du thème ${t.id}`);
      }
      const cle = `${m.data.theme.id}/${m.data.axe}/${m.data.candidat.id}`;
      if (vus.has(cle)) throw new Error(`Mesure ${m.id} : doublon pour ${cle}`);
      vus.add(cle);
    }
    verifie = true;
  }
  return mesures;
}

export async function getMesuresTheme(themeId: string) {
  return (await getMesures()).filter((m) => m.data.theme.id === themeId);
}

export async function getMesuresCandidat(candidatId: string) {
  return (await getMesures()).filter((m) => m.data.candidat.id === candidatId);
}

export async function getGlossaire(): Promise<Terme[]> {
  return (await getCollection('glossaire')).sort((a, b) => collator.compare(a.data.terme, b.data.terme));
}

/** Date la plus récente parmi toutes les fiches. */
export async function getDerniereMaj(): Promise<Date> {
  const dates = [
    ...(await getCollection('themes')).map((t) => t.data.date_maj),
    ...(await getCollection('mesures')).map((m) => m.data.date_maj),
    ...(await getCollection('candidats')).map((c) => c.data.date_verification),
  ];
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

export const nomComplet = (c: Candidat) => `${c.data.prenom} ${c.data.nom}`;

export function formatDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export const STATUT_CANDIDAT: Record<Candidat['data']['statut'], string> = {
  declare: 'Candidature déclarée',
  investi: 'Investi(e) par son parti ou une primaire',
  pressenti: 'Pressenti (non déclaré)',
  retire: 'Candidature retirée',
};

export const STATUT_MESURE = {
  programme: { label: 'Programme écrit', aide: 'Mesure inscrite dans un document officiel du candidat ou de son parti.' },
  orale: { label: 'Annonce orale', aide: 'Mesure annoncée en interview ou en meeting, absente des documents écrits.' },
  aucune: { label: 'Pas de proposition identifiée', aide: 'Le programme publié ne contient pas de proposition sur ce point.' },
  'non-publie': { label: 'Pas encore de proposition', aide: "Le candidat n'a pas encore publié de proposition sur ce point." },
  vide: { label: 'Non vérifié', aide: "Ce point n'a pas encore été vérifié par la rédaction du site." },
} as const;
export type StatutAffiche = keyof typeof STATUT_MESURE;

export const NATURE_BILAN = {
  fonctionne: 'Effets constatés par les évaluations',
  'ne-fonctionne-pas': 'Limites constatées par les évaluations',
  debat: 'Points qui font débat',
} as const;

/** Chemin interne tenant compte du `base` éventuel. */
export const url = (p: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${p}`;

/** Initiales pour le monogramme : première lettre du prénom et du nom. */
export const initiales = (c: Candidat) =>
  (c.data.prenom.charAt(0) + c.data.nom.replace(/^(de |d'|le |la )/i, (m) => m).charAt(0)).toUpperCase();

/** Nombre de mesures effectives (écrites ou orales) d'un thème. */
export async function compterMesures(themeId: string) {
  return (await getMesuresTheme(themeId)).filter((m) => m.data.statut === 'programme' || m.data.statut === 'orale').length;
}
