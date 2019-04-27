import { URLExt } from '@jupyterlab/coreutils';

import { ServerConnection } from '@jupyterlab/services';

export namespace Server {
  const settings = ServerConnection.defaultSettings;

  export async function makeRequest(
    endpoint: string,
    request: RequestInit
  ): Promise<Response> {
    const url = URLExt.join(settings.baseUrl, endpoint)
    return await ServerConnection.makeRequest(url, request, settings)
  }
}
