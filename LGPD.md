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

## Remoção e contestação

O clube deve manter um canal para:

- Remover foto.
- Remover marcação de jogador.
- Corrigir nome, apelido ou estatística.
- Revogar consentimento de imagem.
