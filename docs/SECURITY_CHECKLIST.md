# Checklist de segurança

## Supabase

- RLS ativo em tabelas expostas.
- Funções auxiliares usam `search_path` fixo.
- Funções `security definer` administrativas não concedem `EXECUTE` a `anon` ou `authenticated`.
- Leitura pública limitada a dados esportivos permitidos.
- `photo_player_tags` públicas somente com `confirmed_by_admin = true`.
- `photos` públicas somente com `is_public = true`.
- `player_face_references` sem leitura pública.
- `player_face_embeddings` sem leitura pública.
- `face_detection_suggestions` sem leitura pública.
- Tabelas financeiras sem leitura pública.
- `audit_logs` sem leitura pública.
- `member_profiles` sem leitura anônima e limitada ao titular ou admin esportivo.
- Campos protegidos de `member_profiles` reforçados por trigger no banco.

## Chaves

- `NEXT_PUBLIC_SUPABASE_URL` pode ir ao client.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` pode ir ao client.
- `SUPABASE_SERVICE_ROLE_KEY` apenas em scripts/server-side.
- `.env.local` ignorado pelo Git.
- `.env.example` sem valores reais.
- Credenciais AWS, quando o provider opcional for usado, somente server-side.
- `FACE_RECOGNITION_API_KEY` somente server-side e igual à `FACE_API_KEY` do serviço.
- Módulos do provider protegidos por `server-only`.
- `FACE_RECOGNITION_AUTO_APPROVE=false` em todos os ambientes.

## Admin

- Login unificado disponível em `/entrar`; `/admin/login` apenas redireciona por compatibilidade.
- `/admin/*` protegido por `src/proxy.ts`.
- Server Actions chamam `requireAdmin`.
- Cadastro público nunca escreve em `admin_profiles`.
- `user_metadata` não concede roles nem acesso administrativo.
- `/admin/cadastros` restrito a `super_admin` e `sports_admin`.
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
- Microserviço bloqueia redes privadas e permite restringir hosts por
  `FACE_ALLOWED_IMAGE_HOSTS`.

## LGPD

- Coletar consentimento de imagem.
- Coletar consentimento específico para reconhecimento facial.
- Manter fotos de referência privadas.
- Permitir remoção de foto ou marcação.
- Publicar apenas tags confirmadas por humano.
- Revogar consentimento limpa o embedding e metadados biométricos privados.
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
- Validar cadastro, confirmação de e-mail, recuperação de senha e logout de membro.
- Configurar Site URL, Redirect URLs e SMTP próprio no Supabase Auth.
- Confirmar que conta comum não acessa `/admin`.
- Validar que o menu público não mostra admin.
- Validar que produção usa `FACE_RECOGNITION_PROVIDER=insightface`.
- Validar `/health` do microserviço antes do deploy do Next.js.
- Testar geração e remoção de embedding com uma referência consentida antes de liberar o lote.
