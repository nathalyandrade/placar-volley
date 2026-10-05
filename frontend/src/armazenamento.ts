import { PLACAR_ZERADO, type Placar } from './regras'

const CHAVE = 'placar-volley:v2'

export interface Salvo {
  id: string
  placar: Placar
}

// crypto.randomUUID só existe em HTTPS/localhost; no Wi-Fi local (http://192.168...) usa o fallback
function novoId(): string {
  if (crypto.randomUUID) return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

export function carregar(): Salvo {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? 'null') as Salvo | null
    if (salvo?.id && Number.isInteger(salvo.placar?.azul) && Number.isInteger(salvo.placar?.vermelho)) {
      return salvo
    }
  } catch {
    // armazenamento indisponível ou corrompido: começa do zero
  }
  return { id: novoId(), placar: PLACAR_ZERADO }
}

export function salvar(salvo: Salvo) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(salvo))
  } catch {
    // sem armazenamento local: o placar só vive enquanto a tela estiver aberta
  }
}
