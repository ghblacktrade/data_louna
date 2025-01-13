export type CommonRepositoryResponse<PAYLOAD> = Promise<{
  error?: string;
  payload?: PAYLOAD | null;
}>;
