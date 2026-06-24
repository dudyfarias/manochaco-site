# Configuração do reconhecimento facial

## Banco

Aplique a migration:

```text
supabase/migrations/20260624140800_add_insightface_embeddings.sql
```

Ela cria `player_face_embeddings`, habilita RLS, permite acesso somente às
roles administrativas de fotos e migra embeddings legados consentidos. A
tabela não possui leitura pública.

## Microserviço

```bash
cd services/face-recognition
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

Variáveis:

```env
FACE_API_KEY=uma-chave-longa-e-aleatoria
FACE_MODEL_NAME=buffalo_l
FACE_DETECTION_SIZE=640
FACE_MIN_CONFIDENCE=0.45
FACE_MATCH_THRESHOLD=0.35
MAX_IMAGE_MB=15
IMAGE_REQUEST_TIMEOUT_SECONDS=20
FACE_ALLOWED_IMAGE_HOSTS=yfjniefejnahenwbtdyn.supabase.co,manochaco-site.vercel.app
```

O primeiro processamento baixa o modelo. `/health` não força esse carregamento.

## Next.js e Vercel

```env
FACE_RECOGNITION_PROVIDER=insightface
FACE_RECOGNITION_API_URL=https://seu-servico.example.com
FACE_RECOGNITION_API_KEY=a-mesma-chave-do-servico
FACE_RECOGNITION_MIN_CONFIDENCE=0.75
FACE_RECOGNITION_MAX_DISTANCE=0.6
FACE_RECOGNITION_BATCH_LIMIT=5
FACE_RECOGNITION_AUTO_APPROVE=false
```

`FACE_RECOGNITION_API_KEY` é server-side. Não use `NEXT_PUBLIC_`. Mock é
proibido em produção e face-api permanece somente como legado local.

## Fluxo administrativo

1. Abra `/admin/reconhecimento-facial` e teste a conexão.
2. Em `/admin/jogadores/[id]`, envie uma referência com um único rosto.
3. Registre consentimento e aprovação.
4. Clique em **Gerar embedding**.
5. Em `/admin/galeria/fotos/[id]`, processe uma foto.
6. Revise em `/admin/fotos/revisao`.
7. Confirme, troque ou ignore cada sugestão.

Somente a confirmação ou troca cria uma tag pública `ai_confirmed`.

## Diagnóstico

- **Serviço indisponível:** confira URL, chave, health e logs do container.
- **Nenhum rosto:** use imagem maior e mais nítida.
- **Múltiplos rostos na referência:** escolha uma foto individual.
- **Sem sugestões:** gere embeddings InsightFace consentidos e calibre o
  threshold.
- **URL bloqueada:** inclua apenas o host confiável em
  `FACE_ALLOWED_IMAGE_HOSTS`.
- **Timeout:** reduza o lote e verifique memória/CPU do microserviço.

Valide com:

```bash
npm run audit:mocks
npm run validate:photos
npm run validate:prod
cd services/face-recognition && .venv/bin/python -m pytest -q
```

O deploy separado está em `docs/FACE_RECOGNITION_INSIGHTFACE_DEPLOYMENT.md`.
