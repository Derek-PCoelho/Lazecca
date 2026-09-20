# Log de Qualidade de Dados — Migração Lazecca

Gerado durante a Fase 0 da migração, a partir da leitura literal de `design_files/data/cadastro-v2.xlsx` (aba Cédulas). Estas são as três inconsistências de digitação identificadas na planilha, corrigidas automaticamente durante a importação, com decisão registrada aqui para auditoria posterior pelo cliente (Dr. Sergio Costa / equipe).

## 1. Peça C0056 — campo `Ano`

- **Valor original na planilha:** 1658
- **Valor corrigido no banco de produção:** 1958
- **Motivo da correção:** Ano 1658 é fisicamente incompatível com o padrão Cruzeiro (1942-1967) e diverge das demais linhas do grupo de referência C069 (todas 1958). Corrigido para 1958.

## 2. Peça C0020 — campo `Denominação`

- **Valor original na planilha:** "1 ESTAMPA"
- **Valor corrigido no banco de produção:** "1 CRUZEIRO"
- **Motivo da correção:** Valor claramente trocado de coluna (duplicava o campo Estampa/família). Todas as demais linhas do grupo de referência C012 são "1 CRUZEIRO". Corrigido para "1 CRUZEIRO".

## 3. Peça C0006 — campo `Assinaturas ou chancelas`

- **Valor original na planilha:** "1 ESTAMPA"
- **Valor corrigido no banco de produção:** "(vazio)"
- **Motivo da correção:** O campo continha o valor da coluna "Estampa ou família" em vez de nomes de assinantes do Tesouro. Como não é possível inferir com segurança os signatários reais a partir de dados adjacentes, o campo foi importado vazio para preenchimento manual futuro pelo cliente.

## 4. Peça C0055 — campo `Assinaturas ou chancelas`

- **Valor original na planilha:** "2 ESTAMPA"
- **Valor corrigido no banco de produção:** "(vazio)"
- **Motivo da correção:** O campo continha o valor da coluna "Estampa ou família" em vez de nomes de assinantes do Tesouro. Como não é possível inferir com segurança os signatários reais a partir de dados adjacentes, o campo foi importado vazio para preenchimento manual futuro pelo cliente.

## Observação sobre a aba "Moedas"

A aba "Moedas" da planilha está totalmente vazia (nenhuma linha de dado). Os 4 itens de moeda/acessório exibidos no catálogo de demonstração (20.000 Réis Ouro, Morgan Dollar 1885-O, Denário Romano, Álbum Numismático) não têm cadastro real confirmado nesta planilha. Foram migrados com `isSample: true` e novos IDs `C0136`–`C0139` (preservando o ID legado do protótipo em `legacyId`), e devem ser ocultados do catálogo em produção até cadastro formal pelo cliente.
