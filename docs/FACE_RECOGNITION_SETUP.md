# Configuração do reconhecimento facial

## 1. Pré-requisitos

- Projeto Supabase com schema e policies aplicados.
- Bucket privado `face-references` criado por `supabase/storage-policies.sql`.
- Conta AWS em uma região que ofereça Amazon Rekognition.
- Administrador com role `super_admin`, `sports_admin` ou `photo_editor`.

## 2. Aplicar a migration

Em instalações existentes da Fase 8, aplique:

```text
supabase/migrations/20260619130011_add_face_recognition_pipeline.sql
```

Em um projeto novo, `supabase/schema.sql`, `supabase/policies.sql` e
`supabase/storage-policies.sql` já contêm a estrutura completa.

## 3. Criar credencial AWS

Crie um usuário ou role IAM exclusivo para o site com acesso apenas ao
collection configurado. As operações usadas são:

```text
rekognition:DescribeCollection
rekognition:CreateCollection
rekognition:IndexFaces
rekognition:SearchFaces
rekognition:DeleteFaces
```

O sistema envia bytes obtidos do Supabase; não precisa liberar um bucket S3 da
AWS. Use o menor escopo de recurso permitido pela AWS e rotacione as credenciais
periodicamente.

## 4. Configurar ambiente

```env
FACE_RECOGNITION_PROVIDER=aws
AWS_REGION=sa-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REKOGNITION_COLLECTION_ID=manochaco-players
FACE_RECOGNITION_MIN_CONFIDENCE=80
FACE_RECOGNITION_AUTO_APPROVE=false
```

Cadastre as mesmas variáveis server-side na Vercel. Nunca use prefixo
`NEXT_PUBLIC_` nas credenciais AWS. `FACE_RECOGNITION_AUTO_APPROVE` deve
permanecer `false`; o código bloqueia a execução se estiver `true`.

Para testar a interface sem chamar a AWS:

```env
FACE_RECOGNITION_PROVIDER=mock
FACE_RECOGNITION_AUTO_APPROVE=false
```

O mock permite indexar referências, mas não gera correspondências reais.

## 5. Collection

Não é necessário criar o collection manualmente. A primeira indexação chama
`DescribeCollection` e cria `AWS_REKOGNITION_COLLECTION_ID` se ele não existir.
O UUID do jogador é usado como `ExternalImageId`, e o `FaceId` retornado fica em
`player_face_references`.

## 6. Cadastrar e indexar uma referência

1. Acesse `/admin/jogadores/[id]`.
2. Envie uma foto com um rosto frontal, nítido e bem iluminado.
3. Registre o consentimento específico.
4. Marque a referência como aprovada.
5. Clique em **Indexar rosto**.
6. Confirme o estado **Indexada** e o Face ID no admin.

Use mais de uma referência por jogador apenas quando houver consentimento e
necessidade clara. Fotos de referência nunca aparecem no site público.

## 7. Processar e revisar fotos

1. Abra `/admin/galeria/fotos/[id]`.
2. Clique em **Processar reconhecimento facial**.
3. Abra `/admin/fotos/revisao`.
4. Confira bounding box, jogador e confiança.
5. Confirme, troque ou ignore cada sugestão.
6. Verifique a tag confirmada na foto e no perfil público do jogador.

O botão **Processar pendentes** executa uma foto por request. Ele não é uma fila
durável; mantenha lotes pequenos.

## 8. Limites e custos

- AWS Rekognition aceita JPEG/PNG de até 5 MB quando a imagem é enviada em bytes.
- Cada foto coletiva usa uma indexação temporária, buscas por rosto e uma remoção.
- A quantidade de chamadas cresce com o número de rostos detectados.
- Configure AWS Budgets/alerts e acompanhe a página oficial de preços:
  https://aws.amazon.com/rekognition/pricing/
- Não use o fluxo em massa sem revisar custo, timeout e quotas da região.

## 9. Privacidade

- Reconhecimento facial envolve dado biométrico sensível.
- O clube precisa manter prova do consentimento e canal de revogação.
- Revogar uma referência indexada remove o Face ID do collection.
- Sugestões e respostas brutas são privadas.
- Apenas tags confirmadas por humano podem ser públicas.
- Defina prazo de retenção e responsável interno antes do uso em produção.

## 10. Diagnóstico

- **Credenciais ausentes:** confira as variáveis server-side e redeploy da Vercel.
- **Collection inexistente:** confirme `CreateCollection` na policy IAM.
- **Nenhum rosto:** use imagem maior, frontal e com melhor iluminação.
- **Imagem recusada:** converta para JPEG/PNG e reduza para até 5 MB.
- **Download privado falhou:** aplique `storage-policies.sql` e confirme a role admin.
- **Foto externa bloqueada:** mova a imagem para o bucket `photos`.

Depois da configuração, rode `npm run validate:prod` para validar Supabase e os
checks normais de produção. A validação de chamadas AWS deve ser feita por uma
indexação consentida de teste no admin para evitar custos automáticos no build.
