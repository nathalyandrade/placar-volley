using System.Text.Json;
using System.Text.Json.Serialization;
using PlacarVolley.Api.Domain;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<PartidaRepository>();
builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

var api = app.MapGroup("/api/partidas");

api.MapPost("/", (PartidaRepository repo) =>
{
    var partida = repo.Criar();
    return Results.Created($"/api/partidas/{partida.Id}", PartidaDto.De(partida));
});

api.MapGet("/{id:guid}", (Guid id, PartidaRepository repo) =>
    repo.Obter(id) is { } partida ? Results.Ok(PartidaDto.De(partida)) : Results.NotFound());

// Usado pelo app: o celular aplica as regras localmente e envia o placar atual
api.MapPut("/{id:guid}", (Guid id, PlacarDto placar, PartidaRepository repo) =>
{
    var partida = repo.ObterOuCriar(id);
    bool aceito;
    lock (partida) aceito = partida.Definir(placar.PontosAzul, placar.PontosVermelho);
    return aceito
        ? Results.Ok(PartidaDto.De(partida))
        : Results.BadRequest("Placar impossível pelas regras do jogo.");
});

api.MapPost("/{id:guid}/{time}/mais", (Guid id, string time, PartidaRepository repo) =>
    ComTime(time, t => Alterar(repo, id, p => p.AdicionarPonto(t))));

api.MapPost("/{id:guid}/{time}/menos", (Guid id, string time, PartidaRepository repo) =>
    ComTime(time, t => Alterar(repo, id, p => p.RemoverPonto(t))));

api.MapPost("/{id:guid}/zerar", (Guid id, PartidaRepository repo) =>
    Alterar(repo, id, p => { p.Zerar(); return true; }));

app.MapFallbackToFile("index.html");

app.Run();

static IResult ComTime(string time, Func<Time, IResult> acao) =>
    Enum.TryParse<Time>(time, ignoreCase: true, out var t) && Enum.IsDefined(t)
        ? acao(t)
        : Results.BadRequest("Time inválido. Use 'azul' ou 'vermelho'.");

// Operações inválidas (ex.: "+" com jogo encerrado) são ignoradas e devolvem o estado atual.
static IResult Alterar(PartidaRepository repo, Guid id, Func<Partida, bool> acao)
{
    var partida = repo.Obter(id);
    if (partida is null) return Results.NotFound();
    lock (partida) acao(partida);
    return Results.Ok(PartidaDto.De(partida));
}

public record PlacarDto(int PontosAzul, int PontosVermelho);

public record PartidaDto(Guid Id, int PontosAzul, int PontosVermelho, Time? Vencedor, Time? PontoDeJogo)
{
    public static PartidaDto De(Partida p) => new(p.Id, p.PontosAzul, p.PontosVermelho, p.Vencedor, p.PontoDeJogo);
}

public partial class Program;
