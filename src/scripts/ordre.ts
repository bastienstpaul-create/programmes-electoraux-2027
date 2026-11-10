/**
 * Ordre des candidats : aléatoire et stable pendant la session (graine en
 * sessionStorage), ou alphabétique au choix du visiteur.
 * Applique `style.order` à chaque élément [data-candidat] : tous les conteneurs
 * de candidats sont en flex ou grid.
 */
const lire = (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } };
const ecrire = (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* stockage indisponible */ } };

function graine(): number {
  const g = Number(lire('ordre-graine'));
  if (g) return g;
  const n = Math.floor(Math.random() * 2 ** 31) + 1;
  ecrire('ordre-graine', String(n));
  return n;
}

function melanger<T>(liste: T[], seed: number): T[] {
  const a = [...liste];
  let s = seed;
  const rnd = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export type Mode = 'aleatoire' | 'alpha';
export const mode = (): Mode => (lire('ordre-mode') === 'alpha' ? 'alpha' : 'aleatoire');

/** Identifiants dans l'ordre courant. */
export function ordre(): string[] {
  const alpha = (document.body.dataset.candidats ?? '').split(',').filter(Boolean);
  return mode() === 'alpha' ? alpha : melanger(alpha, graine());
}

function appliquer() {
  const rang = new Map(ordre().map((id, i) => [id, i]));
  document.querySelectorAll<HTMLElement>('[data-candidat]').forEach((el) => {
    el.style.order = String(rang.get(el.dataset.candidat!) ?? 99);
  });
  document.querySelectorAll<HTMLElement>('[data-ordre-libelle]').forEach((el) => {
    el.textContent = mode() === 'alpha' ? 'Ordre alphabétique' : 'Ordre aléatoire';
  });
  document.querySelectorAll<HTMLButtonElement>('[data-ordre-bascule]').forEach((b) => {
    b.textContent = mode() === 'alpha' ? 'Mélanger' : 'Trier de A à Z';
  });
  document.dispatchEvent(new CustomEvent('ordre-change'));
}

document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('[data-ordre-bascule]');
  if (!b) return;
  ecrire('ordre-mode', mode() === 'alpha' ? 'aleatoire' : 'alpha');
  appliquer();
});

appliquer();
