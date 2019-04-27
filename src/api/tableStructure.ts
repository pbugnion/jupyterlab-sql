
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
  if (!response.ok) {
    return Private.createErrorResponse(response.status)
  }
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

  export function createError(message: string): ErrorResponse {
    return {
      responseType: 'error',
      responseData: {
        message
      }
    };
  }

  export function createNotFoundError(): ErrorResponse {
    const errorMessage = (
      'Failed to reach server endpoints. ' +
      'Is the server extension installed correctly?'
    );
    return createError(errorMessage)
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

namespace Private {
  export function createErrorResponse(responseStatus: number): TableStructureResponse.Type {
    if (responseStatus === 404) {
      return TableStructureResponse.createNotFoundError()
    } else {
      const errorMessage = 'Unexpected response status from server'
      return TableStructureResponse.createError(errorMessage)
    }
  }
}
