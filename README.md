# Hubv4 — Setup inicial para jogo 3D online

Este repositório foi preparado para iniciar o desenvolvimento de um jogo 3D online com separação entre:

- **Cliente (`apps/client`)**: renderização 3D e interface do jogador.
- **Servidor (`apps/server`)**: sessão multiplayer, estado do mundo e sincronização em tempo real.
- **Pacotes compartilhados (`packages/shared`)**: tipos, contratos de rede e utilitários comuns.

## Estrutura inicial

```txt
.
├── apps/
│   ├── client/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   └── styles.css
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── server/
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── docs/
│   └── session-setup.md
└── package.json
```

## Próximos passos recomendados

1. Definir o **loop de jogo** e o modelo de autoridade (server-authoritative vs client-authoritative).
2. Escolher stack de networking (ex.: WebSocket puro, Colyseus, Nakama, etc.).
3. Estruturar entidades e estado compartilhado em `packages/shared`.
4. Criar MVP jogável com:
   - um mapa simples,
   - spawn de jogadores,
   - movimentação sincronizada,
   - reconciliação básica de estado.

## Rodando localmente

```bash
npm install
npm run dev
```

> O script `dev` executa os workspaces com script `dev` definido.
