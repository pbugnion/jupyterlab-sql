import { URLExt } from '@jupyterlab/coreutils';

import { ServerConnection } from '@jupyterlab/services';

import { ResponseModel } from './responseModel';

export namespace Api {
  const settings = ServerConnection.defaultSettings;

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

  export async function getForQuery(
    connectionString: string,
    query: string
  ): Promise<ResponseModel.Type> {
    const url = URLExt.join(settings.baseUrl, '/jupyterlab-sql/query');
    const request: RequestInit = {
      method: 'POST',
      body: JSON.stringify({ connectionString, query })
    };
    const response = await ServerConnection.makeRequest(url, request, settings);
    const data = await response.json();
    return data;
  }

  export async function getStructure(): Promise<StructureResponse.Type> {
    const url = URLExt.join(settings.baseUrl, '/jupyterlab-sql/structure')
    const request: RequestInit = {
      method: 'POST',
      body: JSON.stringify({})
    }
    const response = await ServerConnection.makeRequest(url, request, settings);
    const data = await response.json()
    return data;
  }
}
