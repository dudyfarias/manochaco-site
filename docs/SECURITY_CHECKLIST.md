# Checklist de segurança

## Supabase

- RLS ativo em tabelas expostas.
- Leitura pública limitada a dados esportivos permitidos.
- `photo_player_tags` públicas somente com `confirmed_by_admin = true`.
- `photos` públicas somente com `is_public = true`.
- `player_face_references` sem leitura pública.
- `face_detection_suggestions` sem leitura pública.
- Tabelas financeiras sem leitura pública.
- `audit_logs` sem leitura pública.

## Chaves

- `NEXT_PUBLIC_SUPABASE_URL` pode ir ao client.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` pode ir ao client.
- `SUPABASE_SERVICE_ROLE_KEY` apenas em scripts/server-side.
- `.env.local` ignorado pelo Git.
- `.env.example` sem valores reais.
- `AWS_SECRET_ACCESS_KEY` e `AWS_ACCESS_KEY_ID` somente server-side.
- Módulos do provider protegidos por `server-only`.
- `FACE_RECOGNITION_AUTO_APPROVE=false` em todos os ambientes.

## Admin

- `/admin/login` é a única rota admin pública.
- `/admin/*` protegido por `src/proxy.ts`.
- Server Actions chamam `requireAdmin`.
- Financeiro liberado apenas para `super_admin` e `finance_admin`.
- Gestão esportiva restrita a roles administrativas.
- Ações críticas devem registrar `audit_logs`.
- Rotas `/api/admin/face-recognition/*` validam sessão e role server-side.
- Route Handlers mutáveis validam `Origin` e UUID em runtime.

## Uploads

- Aceitar apenas imagens.
- Normalizar nomes de arquivos.
- Evitar espaços, acentos e caracteres especiais.
- Separar fotos públicas de referências faciais privadas.
- Fotos de referência limitadas a JPEG/PNG e 5 MB.
- Assinatura binária JPEG/PNG validada antes do upload privado.
- Fotos processadas só podem vir do site ou do host Supabase configurado.
- Redirects de download são bloqueados para reduzir risco de SSRF.

## LGPD

- Coletar consentimento de imagem.
- Coletar consentimento específico para reconhecimento facial.
- Manter fotos de referência privadas.
- Permitir remoção de foto ou marcação.
- Publicar apenas tags confirmadas por humano.
- Revogar consentimento remove o Face ID indexado antes de limpar o registro.
- Definir responsável, prazo de retenção e processo de atendimento ao titular.
- Respostas brutas e IDs do provider permanecem privados.
- Não publicar mensalidades, dívidas, pagamentos ou caixa do clube.

## Produção

- Rodar `npm run typecheck`.
- Rodar `npm run lint`.
- Rodar `npm run build`.
- Rodar `npm run audit:images`.
- Rodar `npm run validate:prod` com Supabase configurado.
- Validar login e logout admin.
- Validar que o menu público não mostra admin.
- Configurar AWS Budgets/alertas e acompanhar custo por volume de rostos.
- Testar indexação e remoção com uma referência consentida antes de liberar o lote.
