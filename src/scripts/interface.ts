/** Accordéons, thème clair/sombre, partage. Délégation d'événements globale. */

export function toast(message: string) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

document.addEventListener('click', async (e) => {
  const cible = e.target as HTMLElement;

  // Accordéon : <button aria-expanded aria-controls>
  const acc = cible.closest<HTMLButtonElement>('button[data-accordeon]');
  if (acc) {
    const ouvert = acc.getAttribute('aria-expanded') === 'true';
    acc.setAttribute('aria-expanded', String(!ouvert));
    const zone = document.getElementById(acc.getAttribute('aria-controls')!);
    if (zone) zone.hidden = ouvert;
    return;
  }

  // Thème clair / sombre
  if (cible.closest('#bascule-theme')) {
    const sombre = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const t = sombre ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch { /* indisponible */ }
    return;
  }

  // Partage
  const part = cible.closest<HTMLButtonElement>('[data-partager]');
  if (part) {
    const url = location.href;
    const titre = part.dataset.partager || document.title;
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ title: titre, url }); } catch { /* annulé */ }
      return;
    }
    try { await navigator.clipboard.writeText(url); toast('Lien copié'); }
    catch { prompt('Copiez ce lien :', url); }
  }
});
