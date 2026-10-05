# Placar Vôlei

Placar simples para vôlei, sem anúncios, pensado para ser usado no celular.

**Abrir o app:** https://nathalyandrade.github.io/placar-volley/

- Tela dividida: time **Azul** e time **Vermelho** (em pé = cima/baixo, deitado = lado a lado)
- **+** adiciona ponto, **−** corrige um ponto marcado por engano
- **Zerar** pede confirmação (toque duas vezes) para evitar acidentes
- Regra: vence quem chegar a **15 pontos com 2 de vantagem** (15x13, 16x14, 17x15...)
- Mostra "Ponto de jogo" e "Venceu!"; com o jogo encerrado, o "+" fica bloqueado
- **Funciona sem servidor e sem internet**: as regras rodam no próprio celular e o placar fica salvo nele

## Como funciona

```
Celular (React)                                 Backend (.NET)
  regras do jogo (regras.ts)                      mesmas regras (Partida.cs)
  placar salvo no aparelho (localStorage)  ──►    recebe o placar quando acessível (PUT)
  app guardado para uso offline (sw.js)           valida e recusa placares impossíveis
```

- O celular é quem decide o placar. Cada ponto aparece na hora, com ou sem conexão.
- Se o backend estiver acessível, o placar é enviado em segundo plano. Se não estiver,
  o app tenta de novo a cada 10 segundos e quando a conexão volta.
- Depois da primeira visita, o app abre mesmo sem servidor nem internet
  (exige que ele tenha sido aberto por **HTTPS** ou `localhost`; veja abaixo).

As regras existem nos dois lados e têm testes nos dois:
`frontend/src/regras.ts` e `backend/PlacarVolley.Api/Domain/Partida.cs`.
Se mudar uma regra, mude nos dois.

## Estrutura

```
backend/   API em .NET (minimal API) + testes xUnit
frontend/  React + Vite + TypeScript + testes Vitest
```

O build do frontend é gerado em `backend/PlacarVolley.Api/wwwroot`, então o
backend também serve o app.

## Rodando

Pré-requisitos: .NET SDK 8+ (o projeto está em `net10.0`; para .NET 8 troque o
`TargetFramework` nos `.csproj`) e Node.js 20+.

```bash
# 1. Compilar o frontend (gera os arquivos em backend/PlacarVolley.Api/wwwroot)
cd frontend
npm ci
npm run build

# 2. Subir o backend, acessível pela rede local
cd ../backend/PlacarVolley.Api
dotnet run --urls http://0.0.0.0:5180
```

No celular (mesma rede Wi-Fi), abra `http://<ip-do-computador>:5180` e use
"Adicionar à tela de início" para abrir como app em tela cheia.

### Usar na quadra sem computador

Endereços `http://` da rede local (ex.: `http://192.168.0.10:5180`) **não** permitem
o modo offline: o navegador só guarda o app se ele vier de HTTPS. Mesmo assim,
o placar fica salvo no celular, mas a página precisa do computador para abrir.

Para não depender de nada na quadra, use a versão publicada no GitHub Pages
(link no topo). Ela é atualizada automaticamente a cada push na `main` pelo workflow
`.github/workflows/pages.yml`, que roda os testes e publica só o frontend
(sem backend, com a sincronização desligada).

Para publicar em outra hospedagem estática com HTTPS (Netlify, Cloudflare Pages...):

```bash
cd frontend
npm run build -- --outDir dist     # gera frontend/dist
```

Publique a pasta `dist`. Abra o endereço uma vez no celular (com internet) e
adicione à tela de início. Depois disso, o app abre e funciona offline.

Para sincronizar com um backend publicado em outro endereço, defina a URL da API no build:

```bash
VITE_API_URL=https://minha-api.exemplo.com/api npm run build -- --outDir dist
```

Sem backend, o app funciona igual; os envios só falham em silêncio.

### Desenvolvimento

```bash
cd backend/PlacarVolley.Api && dotnet run   # API em http://localhost:5180
cd frontend && npm run dev                 # Vite com proxy de /api para a API
```

### Testes

```bash
cd backend && dotnet test     # regras + validação de placar (C#)
cd frontend && npm test       # regras (TypeScript)
```

## API

| Método | Rota                                        | Ação                                     |
|--------|---------------------------------------------|------------------------------------------|
| PUT    | `/api/partidas/{id}`                        | Grava o placar enviado pelo app (valida) |
| POST   | `/api/partidas`                             | Cria uma partida                         |
| GET    | `/api/partidas/{id}`                        | Consulta o placar                        |
| POST   | `/api/partidas/{id}/{azul\|vermelho}/mais`  | Adiciona ponto                           |
| POST   | `/api/partidas/{id}/{azul\|vermelho}/menos` | Remove ponto                             |
| POST   | `/api/partidas/{id}/zerar`                  | Zera o placar                            |

Corpo do `PUT`: `{ "pontosAzul": 16, "pontosVermelho": 14 }`. Placares impossíveis
pelas regras (ex.: `20x10`, que continuou depois de já ter vencedor) recebem `400`.

As partidas ficam em memória no servidor; a cópia que vale é a do celular.
