export type CommonServiceResponse<PAYLOAD> = Promise<{
  error?: string;
  payload?: PAYLOAD;
}>;
