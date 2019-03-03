import { URLExt } from '@jupyterlab/coreutils';

import { ServerConnection } from '@jupyterlab/services';

import { ResponseModel } from './responseModel';

export namespace Api {
  const settings = ServerConnection.defaultSettings;

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
}
