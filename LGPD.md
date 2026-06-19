# LGPD

O site exibirá fotos e dados esportivos de pessoas identificáveis. A evolução do
produto deve seguir princípios de minimização, transparência e consentimento.

## Uso de imagem

- Coletar autorização de uso de imagem dos atletas.
- Informar onde as fotos serão publicadas.
- Permitir solicitação de remoção.
- Evitar publicar imagens sensíveis ou constrangedoras.

## Dados pessoais

Dados como nome, apelido, posição, número e estatísticas devem ter finalidade
clara: histórico esportivo e comunicação institucional do clube.

## Dados financeiros

A planilha contém informações financeiras por jogador e competição. Esses dados
não devem ser publicados no site aberto.

- Exigir login para acesso financeiro.
- Restringir acesso a administradores.
- Armazenar valores monetários em centavos.
- Registrar auditoria de importações e alterações.
- Evitar expor saldos individuais fora do contexto administrativo.
- Permitir acesso financeiro apenas a `super_admin` e `finance_admin`.

## Biometria e reconhecimento facial

Reconhecimento facial envolve dado biométrico, que é sensível. Antes de qualquer
uso real:

- Obter consentimento específico.
- Explicar finalidade e funcionamento.
- Manter revisão humana obrigatória.
- Permitir revogação de consentimento.
- Evitar retenção de embeddings faciais quando não forem necessários.
- Manter fotos de referência fora do site público.
- Exibir publicamente apenas marcações confirmadas.
- Tratar sugestões de IA como internas até aprovação.
- Registrar finalidade: organização do acervo esportivo do clube.
- Permitir remoção de foto, marcação e referência facial.
- Registrar qual provider processou a imagem e quando ocorreu a indexação.
- Definir prazo de retenção para referências, sugestões e respostas técnicas.
- Revisar o contrato, região de processamento e responsabilidades do fornecedor externo.
- Limitar o acesso às roles `super_admin`, `sports_admin` e `photo_editor`.

## Fluxo implementado

- A referência fica no bucket privado `face-references`.
- Consentimento e aprovação são validados antes da indexação.
- O Amazon Rekognition armazena vetor/metadata facial em collection dedicada; a foto de referência permanece no Supabase privado.
- Fotos coletivas geram sugestões pendentes, nunca tags públicas automáticas.
- Confirmar ou trocar uma sugestão é uma decisão humana auditada.
- Revogar consentimento de uma referência indexada solicita a exclusão do Face ID no provider antes de limpar os metadados locais.
- `raw_response`, Face IDs e referências não são expostos nas APIs públicas.

Antes da ativação em produção, o clube deve registrar base legal aplicável,
responsável pelo tratamento, política de retenção e canal de atendimento ao
titular. Consentimento na interface não substitui o documento/autorização
formal mantido pelo clube.

## Consentimento futuro

Uma futura tela `/admin/consentimentos` deve registrar:

- jogador;
- status de consentimento;
- data da autorização;
- finalidade;
- opção de revogar;
- observações administrativas.

## Supabase e Storage

- Usar RLS para restringir escrita administrativa.
- Guardar logs de auditoria.
- Separar permissões de leitura pública e upload.
- Não expor chaves sensíveis no frontend.
- Manter `face-references` como bucket privado.
- Usar `player_face_references` apenas com consentimento específico.
- Exibir publicamente apenas tags confirmadas em `photo_player_tags`.
- Tratar `face_detection_suggestions` como dado interno de revisão.
- Manter tabelas financeiras privadas por RLS, sem policies de leitura pública.

## Autenticação administrativa

O painel administrativo usa Supabase Auth com checagem server-side de permissões.
Roles administrativas ficam em `admin_profiles`; decisões de autorização não
devem depender de `user_metadata`, pois esse campo pode ser editável pelo
usuário. Chaves de service role são exclusivas de scripts e rotas confiáveis.

Papéis previstos:

- `super_admin`: acesso total;
- `sports_admin`: gestão esportiva;
- `finance_admin`: financeiro privado;
- `photo_editor`: fotos e marcações;
- `viewer`: leitura administrativa.

Depois da migração inicial, a planilha deixa de ser a fonte de atualização. O
painel administrativo deve ser o caminho oficial para corrigir ou remover dados
pessoais.

## Remoção e contestação

O clube deve manter um canal para:

- Remover foto.
- Remover marcação de jogador.
- Corrigir nome, apelido ou estatística.
- Revogar consentimento de imagem.
