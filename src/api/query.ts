
import { Server } from './server';

export namespace ResponseModel {
  export type Type = ErrorResponse | SuccessResponse;

  interface ErrorResponse {
    responseType: 'error';
    responseData: ErrorResponseData;
  }

  interface SuccessResponse {
    responseType: 'success';
    responseData: SuccessResponseData;
  }

  interface ErrorResponseData {
    message: string;
  }

  type SuccessResponseData =
    | {
      hasRows: false;
    }
    | {
      hasRows: true;
      keys: Array<string>;
      rows: Array<Array<any>>;
    };

  export function createError(message: string): ErrorResponse {
    return {
      responseType: 'error',
      responseData: {
        message
      }
    };
  }

  export function match<U>(
    response: Type,
    onSuccessWithRows: (keys: Array<string>, rows: Array<Array<any>>) => U,
    onSuccessNoRows: () => U,
    onError: (_: ErrorResponseData) => U
  ): U {
    if (response.responseType === 'error') {
      return onError(response.responseData);
    } else if (response.responseType === 'success') {
      const responseData = response.responseData;
      if (responseData.hasRows) {
        const { keys, rows } = responseData;
        return onSuccessWithRows(keys, rows);
      } else {
        return onSuccessNoRows();
      }
    }
  }
}

export async function getForQuery(
  connectionUrl: string,
  query: string
): Promise<ResponseModel.Type> {
  const request: RequestInit = {
    method: 'POST',
    body: JSON.stringify({ connectionUrl, query })
  };
  const response = await Server.makeRequest('/jupyterlab-sql/query', request);
  const data = await response.json();
  return data;
}
