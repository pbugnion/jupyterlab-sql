import { URLExt } from '@jupyterlab/coreutils';

import { ServerConnection } from '@jupyterlab/services';

import { ResponseModel, StructureResponse, TableStructureResponse } from './models';

export async function getForQuery(
  connectionUrl: string,
  query: string
): Promise<ResponseModel.Type> {
  const request: RequestInit = {
    method: 'POST',
    body: JSON.stringify({ connectionUrl, query })
  };
  const response = await Private.makeRequest('/jupyterlab-sql/query', request);
  const data = await response.json();
  return data;
}

export async function getStructure(): Promise<StructureResponse.Type> {
  const request: RequestInit = {
    method: 'POST',
    body: JSON.stringify({})
  }
  const response = await Private.makeRequest('/jupyterlab-sql/structure', request);
  const data = await response.json()
  return data;
}

export async function getTableStructure(): Promise<TableStructureResponse.Type> {
  const request: RequestInit = {
    method: 'POST',
    body: JSON.stringify({})
  };
  const response = await Private.makeRequest('/jupyterlab-sql/table', request);
  const data = await response.json();
  return data;
}

namespace Private {
  const settings = ServerConnection.defaultSettings;

  export async function makeRequest(
    endpoint: string,
    request: RequestInit
  ): Promise<Response> {
    const url = URLExt.join(settings.baseUrl, endpoint)
    return await ServerConnection.makeRequest(url, request, settings)
  }
}
