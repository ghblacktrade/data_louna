export type CommonAsyncUtilResponse<PAYLOAD> = Promise<CommonUtilResponse<PAYLOAD>>;

export type CommonUtilResponse<PAYLOAD> = {
  error?: string;
  payload?: PAYLOAD;
};
