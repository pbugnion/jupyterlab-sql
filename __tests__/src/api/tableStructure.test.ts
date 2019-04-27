
import { getTableStructure } from '../../../src/api';

import { ServerConnection } from '@jupyterlab/services';

jest.mock('@jupyterlab/services', () => ({
  ServerConnection: {
    defaultSettings: {
      baseUrl: 'https://example.com',
    },
    makeRequest: jest.fn()
  }
}));

namespace Fixtures {

  export const success = {
    responseType: "success",
    responseData: {
      hasRows: true,
      keys: ["key1", "key2"],
      rows: [["a", "b"], ["c", "d"]]
    }
  }

  export const error = {
    responseType: "error",
    responseData: {
      message: "some message",
    }
  }
}

describe('getTabeStructure', () => {
  it.each([
    ['success', Fixtures.success],
    ['error', Fixtures.error]
  ])('valid %#: %s', async (_, response) => {
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(new Response(JSON.stringify(response)))
    )

    const result = await getTableStructure('connectionUrl', 'tableName')
    expect(result).toEqual(response);
    const expectedUrl = "https://example.com/jupyterlab-sql/table";
    const expectedRequest = {
      method: 'POST',
      body: JSON.stringify({
        connectionUrl: 'connectionUrl',
        table: 'tableName'
      })
    }
    expect(ServerConnection.makeRequest).toHaveBeenCalledWith(
      expectedUrl, expectedRequest, ServerConnection.defaultSettings
    );
  })
})

