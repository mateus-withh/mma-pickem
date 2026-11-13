# Pick'em Arena - UFC Points League

Aplicação pessoal para gerenciar Pick'ems e apostas fictícias de MMA/UFC entre amigos, usando uma moeda 100% fictícia chamada **UFC Points**.

> **Sem dinheiro real.** Nenhuma integração com casas de apostas, nenhum processamento de pagamentos. Tudo roda localmente no navegador, com dados salvos em IndexedDB.

## Status do projeto — Fase 8 concluída ✅ (plano completo!)

**Todas as 8 fases do plano original estão prontas.**

### Fase 8 entrega:

- [x] **Exportar backup**: baixa um arquivo `ufc-points-backup-AAAA-MM-DD.json` com todas as tabelas (perfis, transações, configurações, eventos, lutas, apostas, resultados e auditorias de resultado)
- [x] **Importar backup**: seleciona um arquivo, valida com Zod campo a campo antes de aceitar (testei: JSON malformado é rejeitado, objeto com campos faltando é rejeitado, backup de uma versão futura do formato é bloqueado)
- [x] **Duas estratégias de importação**:
  - **Mesclar**: upsert por ID em todas as tabelas — nada é apagado, só adicionado/atualizado
  - **Substituir tudo**: apaga todos os dados atuais antes de importar — irreversível, e só acontece depois de uma confirmação explícita (checkbox "Entendo que isso vai apagar tudo...") além do clique no botão
- [x] **Sempre pede confirmação antes de substituir** — não existe um caminho onde "substituir" acontece sem o usuário marcar o aviso conscientemente
- [x] Resumo do conteúdo do backup (quantos perfis, eventos, lutas, apostas, resultados) mostrado antes de confirmar a importação
- [x] `npm run build` sem erros, e testei o nome do arquivo, a semântica de merge vs. replace, e a validação Zod (aceitar/rejeitar) linha a linha

Teste rápido: vá em Configurações → Backup → "Exportar backup" para baixar o JSON. Para testar a importação, edite manualmente um campo do JSON baixado (ex: apague o campo `active` de um perfil) e tente importar — o app deve recusar com uma mensagem clara em vez de aceitar dados quebrados.

## Como rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:5173

Para gerar a versão de produção (estático, pode ser aberto localmente ou hospedado em qualquer servidor de arquivos estáticos):

```bash
npm run build
npm run preview
```

## Estrutura de pastas

```
src/
  components/
    ui/                 # Layout, Modal, Button, Badge, ComingSoon
    features/
      profiles/          # ProfileCard, ProfileEditDialog (Fase 2)
      wallet/             # ManualAdjustmentDialog, TransactionHistoryList (Fase 2)
      settings/           # InitialBalanceDialog, BackupSection, ImportConfirmDialog (Fase 2 e 8)
      events/             # EventCard, EventFormDialog (Fase 3)
      fights/             # FightCard, FightFormDialog (Fase 3)
      bets/               # BetDialog, FightBettingPanel (Fase 4)
      results/            # ResultFormDialog, FightResultSummary (Fase 5)
      dashboard/           # NextEventCard (Fase 6)
      statistics/          # RankingTable (Fase 6)
      history/              # HistoryEventCard (Fase 7)
  pages/                # Dashboard, Eventos, Evento (detalhe), Ranking, Histórico, Perfil (estatísticas), Configurações
  db/
    schema.ts            # Dexie — v1 perfis/tx/settings · v2 +events/fights · v3 +bets · v4 +results/resultAudits
    seed.ts               # Seed inicial: Matheus e Amigo com 100 UFC Points
  services/
    profileService.ts    # CRUD de perfis + regras de saldo via transação
    walletService.ts       # Cálculo do resumo da carteira a partir do histórico
    eventService.ts       # CRUD de eventos
    fightService.ts        # CRUD de lutas + validação de odds + integridade de main/co-main
    betService.ts           # Colocar/cancelar aposta + reserva de pontos + validações
    resultService.ts         # Registrar resultado + liquidação automática + reversão/correção + auditoria
    backupService.ts          # Exportar/importar JSON com validação Zod (Fase 8)
  store/
    profileStore.ts       # Zustand — perfis/carteiras
    eventStore.ts           # Zustand — eventos/lutas
    betStore.ts               # Zustand — apostas
    resultStore.ts             # Zustand — resultados
  types/                # Profile, Transaction, WalletSummary, AppSettings, MmaEvent, Fight, Bet, FightResult, ResultAuditEntry, BackupData
  utils/
    currency.ts           # Formatação e arredondamento de UFC Points
    odds.ts                 # Fórmulas de odds americanas (lucro, retorno, validação)
    mmaConstants.ts          # Labels de evento/luta/aposta/resultado e categorias de peso
    ranking.ts                # Cálculo e ordenação do ranking (Fase 6)
    statistics.ts              # Estatísticas por perfil e lucro por evento (Fase 7)
    id.ts                     # Geração de IDs
  routes/               # Definição das rotas
```

## Roadmap (concluído)

| Fase | Conteúdo | Status |
|------|----------|--------|
| 1 | Projeto, stack, estrutura de pastas | ✅ Concluída |
| 2 | Banco IndexedDB (Dexie), models, perfis, carteira (saldo inicial de 100 UFC Points) | ✅ Concluída |
| 3 | Eventos, lutas, odds americanas | ✅ Concluída |
| 4 | Sistema de apostas, reserva de pontos, cálculo de lucro potencial | ✅ Concluída |
| 5 | Registro de resultados, liquidação automática, transações | ✅ Concluída |
| 6 | Dashboard e ranking entre jogadores | ✅ Concluída |
| 7 | Histórico e estatísticas | ✅ Concluída |
| 8 | Backup (exportar/importar JSON) | ✅ Concluída |

## Regras de negócio implementadas

- Odds americanas: fórmulas de lucro para odds positivas e negativas (testadas contra todos os exemplos do brief)
- Saldo = carteira derivada do histórico de transações — nunca um número editado diretamente
- Pontos apostados ficam reservados (`saldoDisponível = saldoTotal - pendente`) até a liquidação; o saldo total só muda quando a aposta é liquidada
- Odd usada na aposta é sempre um snapshot, nunca recalculada com a odd atual da luta
- Empate / No Contest → aposta anulada (`VOID`), valor devolvido 100%
- Edição de resultado já liquidado reverte as transações antigas antes de aplicar o novo resultado — nunca duplica ganho ou perda, e fica registrado em auditoria
- Backup: exportar/importar em JSON com validação de schema e confirmação explícita antes de substituir dados

## Funcionalidades propositalmente fora do escopo (conforme o brief)

Método da vitória, Round, Over/Under, Parlay, múltiplas apostas, mais jogadores, login, sincronização online, ranking global, temporadas, conquistas/badges, gráficos e integração com API de MMA, a arquitetura (tipos, serviços) já tem espaço reservado para a maioria dessas expansões futuras, mas nenhuma foi implementada.

## Stack

React · TypeScript · Vite · Tailwind CSS v4 · React Router · Zustand · Dexie.js · React Hook Form · Zod · Lucide React
