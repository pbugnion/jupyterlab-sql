import { Server } from './server';

export async function getDatabaseStructure(
  connectionUrl: string
): Promise<DatabaseStructureResponse.Type> {
  const request: RequestInit = {
    method: 'POST',
    body: JSON.stringify({ connectionUrl })
  };
  const response = await Server.makeRequest(
    '/jupyterlab-sql/database',
    request
  );
  if (!response.ok) {
    return Private.createErrorResponse(response.status);
  }
  const data = await response.json();
  return data;
}

export interface DatabaseObjects {
  tables: Array<string>;
  views: Array<string>
};

export namespace DatabaseStructureResponse {
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
    views?: Array<string>
  };

  type ErrorResponseData = {
    message: string;
  };

  export function createError(message: string): ErrorResponse {
    return {
      responseType: 'error',
      responseData: {
        message
      }
    };
  }

  export function createNotFoundError(): ErrorResponse {
    const errorMessage =
      'Failed to reach server endpoints. ' +
      'Is the server extension installed correctly?';
    return createError(errorMessage);
  }

  export function match<U>(
    response: Type,
    onSuccess: (_: DatabaseObjects) => U,
    onError: (_: ErrorResponseData) => U
  ) {
    if (response.responseType === 'error') {
      return onError(response.responseData);
    } else if (response.responseType === 'success') {
      const { responseData } = response;
      const tables = responseData.tables;
      // Backwards compatibility with server: views can be null or undefined.
      // Remove in versions 4.x.
      const views = responseData.views || [];
      const databaseObjects: DatabaseObjects = {
        tables, views
      }
      return onSuccess(databaseObjects);
    }
  }
}

namespace Private {
  export function createErrorResponse(
    responseStatus: number
  ): DatabaseStructureResponse.Type {
    if (responseStatus === 404) {
      return DatabaseStructureResponse.createNotFoundError();
    } else {
      const errorMessage = 'Unexpected response status from server';
      return DatabaseStructureResponse.createError(errorMessage);
    }
  }
}
