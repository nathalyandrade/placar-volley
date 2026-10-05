import { useEffect, useState } from 'react'
import { carregar, salvar } from './armazenamento'
import { adicionarPonto, PLACAR_ZERADO, pontoDeJogo, removerPonto, vencedor, type Placar, type Time } from './regras'
import { sincronizar } from './sincronizacao'

const NOMES: Record<Time, string> = { azul: 'Azul', vermelho: 'Vermelho' }

export default function App() {
  const [{ id, placar }, setSalvo] = useState(carregar)
  const [confirmandoZerar, setConfirmandoZerar] = useState(false)

  // Guarda no aparelho e envia ao backend (se disponível) a cada mudança
  useEffect(() => {
    salvar({ id, placar })
    sincronizar({ id, placar })
  }, [id, placar])

  // Cancela a confirmação de "zerar" se ninguém tocar de novo em 3s
  useEffect(() => {
    if (!confirmandoZerar) return
    const t = setTimeout(() => setConfirmandoZerar(false), 3000)
    return () => clearTimeout(t)
  }, [confirmandoZerar])

  function alterar(acao: (placar: Placar) => Placar) {
    setSalvo((atual) => ({ ...atual, placar: acao(atual.placar) }))
  }

  function vibrar() {
    navigator.vibrate?.(30)
  }

  function zerar() {
    if (!confirmandoZerar) {
      setConfirmandoZerar(true)
      return
    }
    setConfirmandoZerar(false)
    alterar(() => PLACAR_ZERADO)
  }

  const venceu = vencedor(placar)
  const pontoJogo = pontoDeJogo(placar)
  const encerrada = venceu !== null

  return (
    <main className="placar">
      {(['azul', 'vermelho'] as const).map((time) => {
        const pontos = placar[time]
        return (
          <section key={time} className={`time time-${time} ${venceu === time ? 'venceu' : ''}`}>
            <div className="cabecalho">
              <span className="nome">{NOMES[time]}</span>
              {pontoJogo === time && <span className="selo">Ponto de jogo</span>}
              {venceu === time && <span className="selo">Venceu!</span>}
            </div>

            <div className="pontos" aria-live="polite">{pontos}</div>

            <div className="botoes">
              <button
                className="menos"
                aria-label={`Remover ponto do time ${NOMES[time]}`}
                disabled={pontos === 0}
                onClick={() => alterar((p) => removerPonto(p, time))}
              >
                −
              </button>
              <button
                className="mais"
                aria-label={`Adicionar ponto ao time ${NOMES[time]}`}
                disabled={encerrada}
                onClick={() => {
                  vibrar()
                  alterar((p) => adicionarPonto(p, time))
                }}
              >
                +
              </button>
            </div>
          </section>
        )
      })}

      <div className="centro">
        <button className={`zerar ${confirmandoZerar ? 'confirmando' : ''}`} onClick={zerar}>
          {confirmandoZerar ? 'Confirmar?' : encerrada ? 'Novo jogo' : 'Zerar'}
        </button>
      </div>
    </main>
  )
}
