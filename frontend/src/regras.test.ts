import { describe, expect, it } from 'vitest'
import { adicionarPonto, PLACAR_ZERADO, pontoDeJogo, removerPonto, vencedor, type Placar } from './regras'

const placar = (azul: number, vermelho: number): Placar => ({ azul, vermelho })

describe('vencedor', () => {
  it.each([
    [15, 0, 'azul'],
    [15, 13, 'azul'],
    [13, 15, 'vermelho'],
    [16, 14, 'azul'],
    [15, 17, 'vermelho'],
    [25, 23, 'azul'],
  ] as const)('%i x %i → %s', (azul, vermelho, esperado) => {
    expect(vencedor(placar(azul, vermelho))).toBe(esperado)
  })

  it.each([
    [14, 14],
    [15, 14],
    [15, 15],
    [16, 15],
    [14, 0],
  ])('%i x %i → jogo continua', (azul, vermelho) => {
    expect(vencedor(placar(azul, vermelho))).toBeNull()
  })
})

describe('pontos', () => {
  it('soma ponto ao time', () => {
    expect(adicionarPonto(PLACAR_ZERADO, 'vermelho')).toEqual(placar(0, 1))
  })

  it('não soma ponto com jogo encerrado', () => {
    expect(adicionarPonto(placar(15, 10), 'vermelho')).toEqual(placar(15, 10))
  })

  it('remover ponto corrige e reabre o jogo', () => {
    const corrigido = removerPonto(placar(15, 13), 'azul')
    expect(corrigido).toEqual(placar(14, 13))
    expect(vencedor(corrigido)).toBeNull()
  })

  it('não fica abaixo de zero', () => {
    expect(removerPonto(PLACAR_ZERADO, 'azul')).toEqual(PLACAR_ZERADO)
  })
})

describe('pontoDeJogo', () => {
  it.each([
    [14, 10, 'azul'],
    [14, 14, null],
    [15, 14, 'azul'],
    [15, 16, 'vermelho'],
    [16, 14, null],
  ] as const)('%i x %i → %s', (azul, vermelho, esperado) => {
    expect(pontoDeJogo(placar(azul, vermelho))).toBe(esperado)
  })
})
