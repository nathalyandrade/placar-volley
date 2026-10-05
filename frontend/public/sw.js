// Guarda o app no celular para abrir mesmo sem internet/servidor.
// Página: tenta a rede primeiro (pega atualizações) e cai no cache se estiver offline.
// Demais arquivos (JS/CSS com hash no nome): cache primeiro.
const CACHE = 'placar-volley-v2'

// Na instalação, guarda a página e tudo que ela referencia (JS, CSS, ícones, manifest).
// Na primeira visita esses arquivos já carregaram antes do service worker existir,
// então não passariam pelo cache do "fetch" abaixo.
async function guardarApp() {
  const cache = await caches.open(CACHE)
  const res = await fetch('./', { cache: 'no-store' })
  const html = await res.clone().text()
  const arquivos = [...html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)].map((m) => m[1])
  await cache.put('./', res)
  await cache.addAll(arquivos)
}

self.addEventListener('install', (event) => {
  event.waitUntil(guardarApp().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone()
          caches.open(CACHE).then((c) => c.put('./', copia))
          return res
        })
        .catch(() => caches.match('./')),
    )
    return
  }

  event.respondWith(
    caches.match(req).then(
      (cache) =>
        cache ??
        fetch(req).then((res) => {
          if (res.ok) {
            const copia = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copia))
          }
          return res
        }),
    ),
  )
})
