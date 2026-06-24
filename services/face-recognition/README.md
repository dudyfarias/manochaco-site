# Manochaco InsightFace Service

Microserviço privado que detecta rostos e sugere jogadores para o painel do
Manochaco. Ele não acessa o Supabase diretamente e nunca publica marcações.

## Requisitos

- Python 3.11 recomendado.
- CPU x86_64 ou ARM64 com memória suficiente para o modelo.
- Uso não comercial compatível com a licença dos modelos pré-treinados do
  InsightFace. Reavalie a licença antes de qualquer uso comercial.

## Instalação local

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

O primeiro processamento baixa o pacote `buffalo_l`, com aproximadamente
326 MB, para o cache do usuário. O `/health` não carrega o modelo e continua
rápido durante deploys e probes.

## Configuração

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

`FACE_MATCH_THRESHOLD` é a similaridade cosseno mínima entre embeddings
normalizados. Quanto maior, mais conservador. O campo `confidence` retornado é
um escore normalizado de ordenação, não uma probabilidade biométrica. O valor
precisa ser calibrado com fotos reais do clube. `FACE_ALLOWED_IMAGE_HOSTS`
permite explicitamente hosts conhecidos; URLs locais e redes privadas são
bloqueadas por padrão.

## Endpoints

Health público:

```bash
curl http://localhost:8000/health
```

Gerar embedding de uma referência:

```bash
curl -X POST http://localhost:8000/embed-face \
  -H "x-face-api-key: SUA_CHAVE" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"URL_DA_IMAGEM","externalId":"player-dudu"}'
```

Processar uma foto:

```bash
curl -X POST http://localhost:8000/process-photo \
  -H "x-face-api-key: SUA_CHAVE" \
  -H "Content-Type: application/json" \
  -d '{
    "photoId":"photo-id",
    "imageUrl":"URL_DA_FOTO",
    "knownFaces":[
      {"playerId":"player-id","playerSlug":"dudu","embedding":[0.1,0.2]}
    ]
  }'
```

Comparar dois embeddings:

```bash
curl -X POST http://localhost:8000/compare \
  -H "x-face-api-key: SUA_CHAVE" \
  -H "Content-Type: application/json" \
  -d '{"firstEmbedding":[1,0],"secondEmbedding":[0.99,0.01]}'
```

## Testes

```bash
pip install -r requirements-dev.txt
pytest -q
```

Os testes de API usam um engine injetado e não baixam o modelo. O teste manual
com uma foto real valida o download e o runtime ONNX do ambiente de deploy.

## Docker

```bash
docker build -t manochaco-insightface .
docker run --rm -p 8000:8000 --env-file .env manochaco-insightface
```

O container usa CPU. Em provedores com GPU, substitua `onnxruntime` por
`onnxruntime-gpu` e configure o provider CUDA no serviço.

O pacote InsightFace 1.0.1 já declara `opencv-python`. Não instalamos também
`opencv-python-headless`, pois manter os dois wheels no mesmo ambiente duplica
binários. O Dockerfile inclui as bibliotecas Linux necessárias ao OpenCV.
