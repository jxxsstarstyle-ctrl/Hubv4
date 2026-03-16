# Setup da sessão de desenvolvimento

## Objetivo
Deixar o time pronto para iniciar o MVP de um jogo 3D online sem perder tempo com organização inicial.

## Decisões já aplicadas
- Monorepo com `npm workspaces`.
- Separação entre cliente 3D, servidor online e pacote compartilhado.
- Configuração base de TypeScript para consistência entre módulos.

## Convenções iniciais
- Lógica de sincronização multiplayer vai para `apps/server`.
- Tipos de mensagens, snapshots e entidades vão para `packages/shared`.
- Cliente 3D só consome contratos definidos no compartilhado.

## Primeiro backlog sugerido
1. Definir protocolo de mensagens (join, input, snapshot, disconnect).
2. Implementar estado autoritativo de jogadores no servidor.
3. Renderizar um cubo por jogador no cliente e atualizar via snapshots.
4. Adicionar interpolação e correção de posição no cliente.
