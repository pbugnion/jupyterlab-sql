import { Api } from '../../src/api';

import { ServerConnection } from '@jupyterlab/services';

jest.mock('@jupyterlab/services', () => ({
  ServerConnection: {
    defaultSettings: {
      baseUrl: 'https://example.com',
    },
    makeRequest: jest.fn()
  }
}));

describe('getForQuery', () => {
  it.each([
    [
      'success with data',
      {
        responseType: "success",
        responseData: {
          hasRows: true,
          keys: ["key1", "key2"],
          rows: [["a", "b"], ["c", "d"]]
        }
      }
    ],
    [
      'success with no data',
      {
        responseType: "success",
        responseData: {
          hasRows: false
        }
      }
    ],
    [
      'error',
      {
        responseType: "error",
        responseData: {
          message: "some message",
        }
      }
    ]
  ])('valid %#: %s', async (_, response) => {
    ServerConnection.makeRequest = jest.fn(() => Promise.resolve(new Response(JSON.stringify(response))))

    const result = await Api.getForQuery("connectionUrl", "query");
    expect(result).toEqual(response);
    const expectedUrl = "https://example.com/jupyterlab-sql/query"
    const expectedRequest = {
      method: 'POST',
      body: JSON.stringify({
        connectionUrl: "connectionUrl",
        query: "query"
      })
    };
    expect(ServerConnection.makeRequest).toHaveBeenCalledWith(
      expectedUrl, expectedRequest, ServerConnection.defaultSettings
    );
  })
})
