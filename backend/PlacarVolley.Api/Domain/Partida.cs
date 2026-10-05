namespace PlacarVolley.Api.Domain;

public enum Time
{
    Azul,
    Vermelho
}

/// <summary>
/// Regras: vence quem chegar a 15 pontos (ou mais) com pelo menos 2 pontos de vantagem.
/// Ex.: 15x13, 16x14, 17x15...
/// </summary>
public class Partida
{
    public const int PontosParaVencer = 15;
    public const int DiferencaMinima = 2;

    public Partida() : this(Guid.NewGuid()) { }

    public Partida(Guid id) => Id = id;

    public Guid Id { get; }
    public int PontosAzul { get; private set; }
    public int PontosVermelho { get; private set; }

    public Time? Vencedor
    {
        get
        {
            if (PontosAzul >= PontosParaVencer && PontosAzul - PontosVermelho >= DiferencaMinima)
                return Time.Azul;
            if (PontosVermelho >= PontosParaVencer && PontosVermelho - PontosAzul >= DiferencaMinima)
                return Time.Vermelho;
            return null;
        }
    }

    public bool Encerrada => Vencedor is not null;

    /// <summary>Ponto de set/jogo: um ponto a mais encerra a partida.</summary>
    public Time? PontoDeJogo
    {
        get
        {
            if (Encerrada) return null;
            if (PontosAzul + 1 >= PontosParaVencer && PontosAzul + 1 - PontosVermelho >= DiferencaMinima)
                return Time.Azul;
            if (PontosVermelho + 1 >= PontosParaVencer && PontosVermelho + 1 - PontosAzul >= DiferencaMinima)
                return Time.Vermelho;
            return null;
        }
    }

    public bool AdicionarPonto(Time time)
    {
        if (Encerrada) return false;

        if (time == Time.Azul) PontosAzul++;
        else PontosVermelho++;
        return true;
    }

    /// <summary>Corrige um ponto marcado por engano. Pode reabrir uma partida encerrada.</summary>
    public bool RemoverPonto(Time time)
    {
        if (time == Time.Azul)
        {
            if (PontosAzul == 0) return false;
            PontosAzul--;
        }
        else
        {
            if (PontosVermelho == 0) return false;
            PontosVermelho--;
        }
        return true;
    }

    /// <summary>
    /// Define o placar recebido do celular. Rejeita placares impossíveis pelas regras,
    /// como números negativos ou um jogo que continuou depois de já ter um vencedor (ex.: 20x10).
    /// </summary>
    public bool Definir(int azul, int vermelho)
    {
        if (!PlacarPossivel(azul, vermelho)) return false;
        PontosAzul = azul;
        PontosVermelho = vermelho;
        return true;
    }

    public static bool PlacarPossivel(int azul, int vermelho)
    {
        if (azul < 0 || vermelho < 0) return false;

        var vencedor = Math.Max(azul, vermelho);
        var perdedor = Math.Min(azul, vermelho);
        var temVencedor = vencedor >= PontosParaVencer && vencedor - perdedor >= DiferencaMinima;

        // Quem venceu marcou exatamente o ponto que fechou o jogo, nem um a mais
        return !temVencedor || vencedor == Math.Max(PontosParaVencer, perdedor + DiferencaMinima);
    }

    public void Zerar()
    {
        PontosAzul = 0;
        PontosVermelho = 0;
    }
}
