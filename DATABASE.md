# Banco de dados futuro

Esta fase não implementa Supabase. O desenho abaixo orienta a futura migração.

## Tabelas principais

### import_batches

Registro de cada importação da planilha Manochaco.

- `id`
- `source_filename`
- `source_checksum`
- `imported_by`
- `imported_at`
- `status`
- `notes`

### data_change_logs

Registro de origem e alterações feitas em dados esportivos e administrativos.

- `id`
- `entity_type`
- `entity_id`
- `source`
- `changed_by`
- `change_reason`
- `previous_data`
- `new_data`
- `created_at`

### seasons

- `id`
- `year`
- `slug`
- `name`
- `label`

### competitions

- `id`
- `slug`
- `name`
- `short_name`
- `description`
- `type`
- `is_public`

### players

- `id`
- `slug`
- `full_name`
- `nickname`
- `position`
- `number`
- `status`
- `image_url`
- `joined_year`
- `bio`
- `data_source`
- `source_import_batch_id`
- `created_at`
- `updated_at`

### matches

- `id`
- `slug`
- `date`
- `competition_id`
- `season_id`
- `competition_slug`
- `season_slug`
- `round`
- `venue`
- `status`
- `result`
- `opponent`
- `home_team`
- `away_team`
- `home_score`
- `away_score`
- `summary`
- `image_url`
- `data_source`
- `source_import_batch_id`

### match_contributions

- `id`
- `match_id`
- `player_id`
- `goals`
- `assists`
- `yellow_cards`
- `red_cards`

### player_competition_stats

- `id`
- `player_id`
- `season_id`
- `competition_id`
- `matches`
- `presence_percentage`
- `goals`
- `goals_per_match`
- `assists`
- `goal_participations_per_match`
- `yellow_cards`
- `red_cards`
- `yellow_card_suspensions`
- `clean_sheets`
- `ranking_score`
- `overall`
- `data_source`
- `source_import_batch_id`

### player_all_time_stats

- `id`
- `player_id`
- `matches`
- `presence_percentage`
- `goals`
- `goals_per_match`
- `assists`
- `goal_participations_per_match`
- `yellow_cards`
- `red_cards`
- `yellow_card_suspensions`
- `clean_sheets`
- `ranking_score`
- `overall`
- `data_source`
- `source_import_batch_id`

### player_uniforms

- `id`
- `player_id`
- `has_shirt`
- `shirt_number`
- `white_shirt_number`
- `black_shirt_number`
- `shirt_size`
- `shorts_size`

### finance_competition_costs

Admin-only. Valores monetários sempre em centavos.

- `id`
- `season_id`
- `competition_id`
- `label`
- `cost_cents`
- `suggested_charge_cents`
- `notes`
- `data_source`
- `source_import_batch_id`

### finance_player_charges

Admin-only. Valores monetários sempre em centavos.

- `id`
- `player_id`
- `season_id`
- `competition_id`
- `period`
- `amount_due_cents`
- `amount_paid_cents`
- `balance_cents`
- `status`
- `data_source`
- `source_import_batch_id`

### admin_audit_logs

- `id`
- `admin_user_id`
- `action`
- `entity_type`
- `entity_id`
- `metadata`
- `created_at`

### titles

- `id`
- `name`
- `competition_id`
- `season_id`
- `date`
- `description`
- `is_public`

### albums

- `id`
- `slug`
- `title`
- `description`
- `cover_photo_id`
- `category`
- `match_id`
- `competition_id`
- `season_id`
- `date`

### photos

- `id`
- `slug`
- `album_id`
- `match_id`
- `competition_id`
- `season_id`
- `title`
- `storage_path`
- `alt`
- `caption`
- `category`
- `face_recognition_status`
- `taken_at`
- `uploaded_by`
- `created_at`

### photo_players

- `id`
- `photo_id`
- `player_id`
- `tag_type`
- `confidence`
- `confirmed_by_admin`
- `bounding_box_x`
- `bounding_box_y`
- `bounding_box_width`
- `bounding_box_height`
- `reviewed_by`
- `reviewed_at`
- `created_at`

`tag_type` pode ser `manual`, `ai_suggested` ou `ai_confirmed`. O site público
deve consultar apenas tags confirmadas por admin.

### face_detection_suggestions

- `id`
- `photo_id`
- `suggested_player_id`
- `confidence`
- `bounding_box_x`
- `bounding_box_y`
- `bounding_box_width`
- `bounding_box_height`
- `status`
- `created_at`
- `reviewed_by`
- `reviewed_at`

`status` pode ser `pending`, `confirmed`, `changed` ou `ignored`.

### player_face_references

- `id`
- `player_id`
- `storage_path`
- `approved_for_recognition`
- `consent_given`
- `created_at`
- `removed_at`

Fotos de referência não devem ser públicas automaticamente. Elas servem apenas
para reconhecimento facial, com consentimento específico.

### image_consents

- `id`
- `player_id`
- `consent_type`
- `granted`
- `granted_at`
- `revoked_at`
- `notes`

## Segurança esperada

- RLS habilitado em todas as tabelas públicas.
- Administração apenas para usuários autenticados com papel de admin.
- Tabelas financeiras acessíveis somente por admins autenticados.
- Nenhuma rota pública deve retornar campos financeiros.
- Storage com policies separadas para leitura pública e escrita restrita.
- Nunca expor `service_role` no cliente.
- Logs de auditoria para ações administrativas.
- Dados criados pelo portal devem manter origem `admin_manual` ou
  `admin_correction`.

## Fonte planilha

A planilha Manochaco será importada em fases:

- importador local atual gera arquivos em `src/data/generated`;
- abas de estatísticas para `player_competition_stats` e
  `player_all_time_stats`;
- aba de jogos para `matches`;
- abas financeiras para `finance_competition_costs` e
  `finance_player_charges`, sempre admin-only.
- filtros públicos devem usar somente `matches`, `players`,
  `player_competition_stats`, `player_all_time_stats`, `competitions` e
  `seasons`;
- rankings públicos são calculados por gols, assistências, presença,
  participação em gols e cartões quando disponíveis.

Depois da importação inicial, o painel administrativo poderá criar novos
registros. Novas importações devem comparar dados existentes e gerar conflitos
para revisão em vez de sobrescrever alterações manuais.
