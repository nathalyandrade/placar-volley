using System.Collections.Concurrent;

namespace PlacarVolley.Api.Domain;

/// <summary>Armazena as partidas em memória (suficiente para o uso em quadra).</summary>
public class PartidaRepository
{
    private readonly ConcurrentDictionary<Guid, Partida> _partidas = new();

    public Partida Criar()
    {
        var partida = new Partida();
        _partidas[partida.Id] = partida;
        return partida;
    }

    public Partida? Obter(Guid id) => _partidas.GetValueOrDefault(id);

    public Partida ObterOuCriar(Guid id) => _partidas.GetOrAdd(id, novoId => new Partida(novoId));
}
