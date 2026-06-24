# Deploy do microserviço InsightFace

## Separação de responsabilidades

- Vercel executa Next.js, autenticação administrativa e persistência das
  sugestões.
- Supabase guarda imagens, referências, embeddings e tags.
- O container Python executa InsightFace e não possui chaves Supabase.

## Preparação

Gere uma chave compartilhada:

```bash
openssl rand -hex 32
```

Use o mesmo valor em `FACE_API_KEY` no serviço e
`FACE_RECOGNITION_API_KEY` na Vercel. Nunca versione esse valor.

Configure no serviço:

```env
FACE_API_KEY=
FACE_MODEL_NAME=buffalo_sc
FACE_DETECTION_SIZE=640
FACE_MIN_CONFIDENCE=0.45
FACE_MATCH_THRESHOLD=0.35
MAX_IMAGE_MB=15
FACE_ALLOWED_IMAGE_HOSTS=yfjniefejnahenwbtdyn.supabase.co,manochaco-site.vercel.app
```

## Docker

```bash
cd services/face-recognition
docker build -t manochaco-insightface .
docker run --rm -p 8000:8000 --env-file .env manochaco-insightface
```

O primeiro processamento baixa o `buffalo_sc`. Em produção, use disco ou cache
persistente para `~/.insightface/models` quando o provedor permitir.

## Render

1. Crie um Web Service a partir do repositório.
2. Defina `services/face-recognition` como Root Directory.
3. Selecione Docker.
4. Cadastre as variáveis do serviço.
5. Configure o health check como `/health`.
6. Use uma instância com memória suficiente para modelo e runtime ONNX.

O plano gratuito possui 512 MB. O pacote `buffalo_sc` foi escolhido porque tem
16 MB e a mesma acurácia publicada para `buffalo_s`; `buffalo_l` e `buffalo_s`
reiniciaram a instância durante a inicialização por falta de memória.
Planos que entram em suspensão aumentam o primeiro tempo de resposta.

## Railway

1. Crie um serviço pelo repositório.
2. Aponte o diretório raiz para `services/face-recognition`.
3. Use o Dockerfile e exponha a porta fornecida pela plataforma.
4. Cadastre variáveis e volume de cache quando disponível.

O container respeita a variável `PORT` fornecida pela plataforma. Para reduzir
o consumo de memória, o serviço carrega somente os módulos `detection` e
`recognition` do pacote `buffalo_sc`.

## Fly.io

Crie o app no diretório do serviço, configure secrets com `fly secrets set` e
monte um volume para o cache do modelo. Ajuste CPU e memória após medir o tempo
de processamento das fotos reais.

## VPS

Em uma VPS, execute o container atrás de HTTPS, firewall e proxy reverso. Não
publique a porta 8000 diretamente. Restrinja origem quando possível, monitore
health, memória, latência e erros, e mantenha o sistema atualizado.

## Ativação na Vercel

Depois que `https://servico/health` responder `ok: true`, configure:

```env
FACE_RECOGNITION_PROVIDER=insightface
FACE_RECOGNITION_API_URL=https://servico
FACE_RECOGNITION_API_KEY=
FACE_RECOGNITION_MIN_CONFIDENCE=0.75
FACE_RECOGNITION_MAX_DISTANCE=0.6
FACE_RECOGNITION_BATCH_LIMIT=5
FACE_RECOGNITION_AUTO_APPROVE=false
```

Faça novo deploy, abra `/admin/reconhecimento-facial`, teste a conexão e rode
primeiro uma referência e uma foto. Só depois libere o processamento em lote.

## Rollback

Face-api pode ser usado temporariamente em desenvolvimento, mas não é o padrão.
Em produção, prefira desativar o botão de processamento enquanto o serviço está
indisponível a voltar para mock. Sugestões e tags já revisadas permanecem no
Supabase durante o rollback.
