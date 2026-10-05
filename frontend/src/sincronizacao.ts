import type { Salvo } from './armazenamento'

// Envia o placar para o backend .NET quando ele estiver acessível.
// O app funciona sem ele: falhas são ignoradas e o envio é refeito depois.
// Com VITE_API_URL vazio (ex.: GitHub Pages, sem backend), a sincronização fica desligada.

const API = import.meta.env.VITE_API_URL ?? './api'
const NOVA_TENTATIVA_MS = 10_000

let pendente: Salvo | null = null
let enviando = false
let timer: ReturnType<typeof setTimeout> | undefined

export function sincronizar(salvo: Salvo) {
  if (!API) return
  pendente = salvo
  void enviar()
}

async function enviar() {
  // Um envio por vez; se o placar mudar no meio, manda só o mais recente
  if (enviando || !pendente) return
  enviando = true
  clearTimeout(timer)

  const atual = pendente
  try {
    const res = await fetch(`${API}/partidas/${atual.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pontosAzul: atual.placar.azul, pontosVermelho: atual.placar.vermelho }),
    })
    // 4xx = o servidor recusou este placar; tentar de novo não adianta
    if (res.ok || (res.status >= 400 && res.status < 500)) {
      if (pendente === atual) pendente = null
    }
  } catch {
    // sem conexão com o backend
  } finally {
    enviando = false
  }

  if (pendente === atual) timer = setTimeout(enviar, NOVA_TENTATIVA_MS)
  else void enviar()
}

addEventListener('online', () => void enviar())
