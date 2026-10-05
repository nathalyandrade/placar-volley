// Mesmas regras de backend/PlacarVolley.Api/Domain/Partida.cs:
// vence quem chegar a 15 pontos (ou mais) com pelo menos 2 de vantagem.

export const PONTOS_PARA_VENCER = 15
export const DIFERENCA_MINIMA = 2

export type Time = 'azul' | 'vermelho'

export interface Placar {
  azul: number
  vermelho: number
}

export const PLACAR_ZERADO: Placar = { azul: 0, vermelho: 0 }

const adversario = (time: Time): Time => (time === 'azul' ? 'vermelho' : 'azul')

function venceria(placar: Placar, time: Time): boolean {
  const pontos = placar[time]
  return pontos >= PONTOS_PARA_VENCER && pontos - placar[adversario(time)] >= DIFERENCA_MINIMA
}

export function vencedor(placar: Placar): Time | null {
  if (venceria(placar, 'azul')) return 'azul'
  if (venceria(placar, 'vermelho')) return 'vermelho'
  return null
}

/** Time que vence se marcar o próximo ponto. */
export function pontoDeJogo(placar: Placar): Time | null {
  if (vencedor(placar)) return null
  if (venceria(adicionarPonto(placar, 'azul'), 'azul')) return 'azul'
  if (venceria(adicionarPonto(placar, 'vermelho'), 'vermelho')) return 'vermelho'
  return null
}

/** Com o jogo encerrado, o ponto é ignorado. */
export function adicionarPonto(placar: Placar, time: Time): Placar {
  if (vencedor(placar)) return placar
  return { ...placar, [time]: placar[time] + 1 }
}

/** Corrige um ponto marcado por engano (pode reabrir um jogo encerrado). */
export function removerPonto(placar: Placar, time: Time): Placar {
  if (placar[time] === 0) return placar
  return { ...placar, [time]: placar[time] - 1 }
}
