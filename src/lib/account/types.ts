export const accountTypes = [
  "supporter",
  "player",
  "candidate",
  "partner",
] as const;

export type AccountType = (typeof accountTypes)[number];

export const memberStatuses = [
  "pending",
  "active",
  "rejected",
  "blocked",
] as const;

export type MemberStatus = (typeof memberStatuses)[number];

export type MemberProfile = {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  phone: string | null;
  city: string | null;
  accountType: AccountType;
  status: MemberStatus;
  linkedPlayerId: string | null;
  preferredPosition: string | null;
  birthDate: string | null;
  privacyAcceptedAt: string | null;
  createdAt: string | null;
};

export const accountTypeLabels: Record<AccountType, string> = {
  supporter: "Torcedor",
  player: "Jogador do Manochaco",
  candidate: "Quero jogar no time",
  partner: "Parceiro ou colaborador",
};

export const memberStatusLabels: Record<MemberStatus, string> = {
  pending: "Aguardando análise",
  active: "Ativo",
  rejected: "Não aprovado",
  blocked: "Bloqueado",
};

export function isAccountType(value: unknown): value is AccountType {
  return accountTypes.includes(value as AccountType);
}

export function isMemberStatus(value: unknown): value is MemberStatus {
  return memberStatuses.includes(value as MemberStatus);
}
