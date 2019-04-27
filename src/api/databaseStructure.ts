import { Server } from './server';

// TODO: rename getStructure to getDatabaseStructure

export async function getStructure(connectionUrl: string): Promise<StructureResponse.Type> {
  const request: RequestInit = {
    method: 'POST',
    body: JSON.stringify({ connectionUrl })
  }
  // TODO: use /database as endpoint
  const response = await Server.makeRequest('/jupyterlab-sql/structure', request);
  const data = await response.json()
  return data;
}

export namespace StructureResponse {
  export type Type = ErrorResponse | SuccessResponse;

  interface ErrorResponse {
    responseType: 'error';
    responseData: ErrorResponseData;
  }

  interface SuccessResponse {
    responseType: 'success';
    responseData: SuccessResponseData;
  }

  type SuccessResponseData = {
    tables: Array<string>;
  }

  type ErrorResponseData = {
    message: string;
  }

  export function match<U>(
    response: Type,
    onSuccess: (tables: Array<string>) => U,
    onError: (_: ErrorResponseData) => U
  ) {
    if (response.responseType === 'error') {
      return onError(response.responseData);
    } else if (response.responseType === 'success') {
      const { tables } = response.responseData;
      return onSuccess(tables);
    }
  }
}
