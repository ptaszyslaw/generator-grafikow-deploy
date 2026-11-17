// Service worker Generatora grafików: zapamiętuje pliki aplikacji, żeby działała bez internetu.
// Dane grafiku nie przechodzą przez ten plik — zostają w pliku użytkownika i w jego przeglądarce.
// Strategia: najpierw sieć (nowa wersja od razu, gdy jest internet), przy braku sieci kopia z pamięci.
const PAMIEC = 'generator-grafikow-643c364';
const PLIKI = ['./', 'index.html', 'manifest.webmanifest', 'ikona-192.png', 'ikona-512.png', 'ikona-maskowalna-512.png', 'favicon-32.png'];

self.addEventListener('install', zdarzenie => {
  zdarzenie.waitUntil(caches.open(PAMIEC).then(p => p.addAll(PLIKI)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', zdarzenie => {
  zdarzenie.waitUntil(caches.keys()
    .then(klucze => Promise.all(klucze.filter(k => k !== PAMIEC).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', zdarzenie => {
  const zadanie = zdarzenie.request;
  if (zadanie.method !== 'GET' || new URL(zadanie.url).origin !== self.location.origin) return;
  zdarzenie.respondWith((async () => {
    try {
      const odpowiedz = await fetch(zadanie, { cache: 'no-cache' });
      if (odpowiedz.ok) {
        const kopia = odpowiedz.clone();
        caches.open(PAMIEC).then(p => p.put(zadanie, kopia));
      }
      return odpowiedz;
    } catch {
      const zPamieci = await caches.match(zadanie, { ignoreSearch: true })
        ?? (zadanie.mode === 'navigate' ? await caches.match('index.html') : undefined);
      return zPamieci ?? Response.error();
    }
  })());
});
