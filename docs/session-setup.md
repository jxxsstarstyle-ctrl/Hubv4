# Sessão preparada: lobby + FPS base

## Status atual
- Lobby funcional para entrada na sala com nome.
- Avatar em primeira pessoa com controles de PC (WASD + mouse).
- Sala simples pronta para iteração de gameplay/network.
- Sincronização mínima com servidor via `/input`.

## Arquitetura (MVP)
- Cliente: render por raycasting em canvas (rápido e leve no ambiente atual).
- Servidor: estado autoritativo básico em memória.
- Shared: protocolo inicial para evolução.

## Próximos passos
1. Broadcast em tempo real (WebSocket) em vez de polling de input.
2. Exibir outros jogadores no render (billboards/sprites).
3. Adicionar colisão mais rica e objetos interativos da sala.
4. Migrar para Three.js assim que dependências externas estiverem liberadas.
