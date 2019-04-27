
import { Server } from './server';

export async function getTableStructure(connectionUrl: string, tableName: string): Promise<TableStructureResponse.Type> {
  const payload = {
    connectionUrl,
    table: tableName
  }
  const request: RequestInit = {
    method: 'POST',
    body: JSON.stringify(payload)
  };
  const response = await Server.makeRequest('/jupyterlab-sql/table', request);
  const data = await response.json();
  return data;
}

export namespace TableStructureResponse {
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
    keys: Array<string>;
    rows: Array<Array<any>>;
  }

  interface ErrorResponseData {
    message: string;
  }

  export function match<U>(
    response: Type,
    onSuccess: (keys: Array<string>, rows: Array<Array<any>>) => U,
    onError: (_: ErrorResponseData) => U
  ): U {
    if (response.responseType === 'error') {
      return onError(response.responseData)
    } else if (response.responseType === 'success') {
      const { keys, rows } = response.responseData;
      return onSuccess(keys, rows)
    }
  }
}
