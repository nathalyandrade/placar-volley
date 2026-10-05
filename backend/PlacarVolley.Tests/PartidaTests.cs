using PlacarVolley.Api.Domain;

namespace PlacarVolley.Tests;

public class PartidaTests
{
    private static Partida Placar(int azul, int vermelho)
    {
        var p = new Partida();
        for (var i = 0; i < Math.Min(azul, vermelho); i++)
        {
            p.AdicionarPonto(Time.Azul);
            p.AdicionarPonto(Time.Vermelho);
        }
        for (var i = vermelho; i < azul; i++) p.AdicionarPonto(Time.Azul);
        for (var i = azul; i < vermelho; i++) p.AdicionarPonto(Time.Vermelho);
        return p;
    }

    [Theory]
    [InlineData(15, 0, Time.Azul)]
    [InlineData(15, 13, Time.Azul)]
    [InlineData(13, 15, Time.Vermelho)]
    [InlineData(16, 14, Time.Azul)]
    [InlineData(15, 17, Time.Vermelho)]
    [InlineData(25, 23, Time.Azul)]
    public void Vence_com_15_ou_mais_e_dois_de_vantagem(int azul, int vermelho, Time esperado)
    {
        Assert.Equal(esperado, Placar(azul, vermelho).Vencedor);
    }

    [Theory]
    [InlineData(14, 14)]
    [InlineData(15, 14)]
    [InlineData(15, 15)]
    [InlineData(16, 15)]
    [InlineData(14, 0)]
    public void Partida_continua_sem_vencedor(int azul, int vermelho)
    {
        var p = Placar(azul, vermelho);
        Assert.Null(p.Vencedor);
        Assert.False(p.Encerrada);
    }

    [Fact]
    public void Nao_adiciona_ponto_com_partida_encerrada()
    {
        var p = Placar(15, 10);
        Assert.False(p.AdicionarPonto(Time.Vermelho));
        Assert.Equal(10, p.PontosVermelho);
    }

    [Fact]
    public void Remover_ponto_corrige_e_reabre_partida()
    {
        var p = Placar(15, 13);
        Assert.True(p.RemoverPonto(Time.Azul));
        Assert.Equal(14, p.PontosAzul);
        Assert.False(p.Encerrada);
    }

    [Fact]
    public void Nao_remove_abaixo_de_zero()
    {
        var p = new Partida();
        Assert.False(p.RemoverPonto(Time.Azul));
        Assert.Equal(0, p.PontosAzul);
    }

    [Fact]
    public void Zerar_volta_placar_para_zero()
    {
        var p = Placar(15, 12);
        p.Zerar();
        Assert.Equal(0, p.PontosAzul);
        Assert.Equal(0, p.PontosVermelho);
        Assert.Null(p.Vencedor);
    }

    [Theory]
    [InlineData(14, 10, Time.Azul)]
    [InlineData(14, 14, null)]
    [InlineData(15, 14, Time.Azul)]
    [InlineData(15, 16, Time.Vermelho)]
    public void Indica_ponto_de_jogo(int azul, int vermelho, Time? esperado)
    {
        Assert.Equal(esperado, Placar(azul, vermelho).PontoDeJogo);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(14, 14)]
    [InlineData(15, 13)]
    [InlineData(16, 14)]
    [InlineData(30, 29)]
    [InlineData(5, 15)]
    public void Aceita_placar_possivel(int azul, int vermelho)
    {
        var p = new Partida();
        Assert.True(p.Definir(azul, vermelho));
        Assert.Equal(azul, p.PontosAzul);
        Assert.Equal(vermelho, p.PontosVermelho);
    }

    [Theory]
    [InlineData(-1, 0)]
    [InlineData(16, 10)]
    [InlineData(20, 10)]
    [InlineData(17, 14)]
    [InlineData(10, 18)]
    public void Rejeita_placar_impossivel(int azul, int vermelho)
    {
        var p = Placar(3, 2);
        Assert.False(p.Definir(azul, vermelho));
        Assert.Equal(3, p.PontosAzul);
        Assert.Equal(2, p.PontosVermelho);
    }
}
