import { Server } from './server';

export async function getStructure(connectionUrl: string): Promise<StructureResponse.Type> {
  const request: RequestInit = {
    method: 'POST',
    body: JSON.stringify({ connectionUrl })
  }
  const response = await Server.makeRequest('/jupyterlab-sql/structure', request);
  const data = await response.json()
  return data;
}

export namespace StructureResponse {
  export type Type = ErrorResponse | SuccessResponse;

  interface ErrorResponse {
    responseType: 'error';
  }

  interface SuccessResponse {
    responseType: 'success';
    responseData: SuccessResponseData;
  }

  type SuccessResponseData = {
    tables: Array<string>;
  }

  export function match<U>(
    response: Type,
    onSuccess: (tables: Array<string>) => U,
    onError: () => U
  ) {
    if (response.responseType === 'error') {
      return onError();
    } else if (response.responseType === 'success') {
      const { tables } = response.responseData;
      return onSuccess(tables);
    }
  }
}
