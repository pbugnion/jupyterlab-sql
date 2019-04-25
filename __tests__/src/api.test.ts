import { Api } from '../../src/api';

import { ServerConnection } from '@jupyterlab/services';

import { ResponseModel } from '../../src/responseModel';

jest.mock('@jupyterlab/services', () => ({
  ServerConnection: {
    defaultSettings: {
      baseUrl: 'https://example.com',
    },
    makeRequest: jest.fn()
  }
}));

namespace Fixtures {
  export const successWithData = {
    responseType: "success",
    responseData: {
      hasRows: true,
      keys: ["key1", "key2"],
      rows: [["a", "b"], ["c", "d"]]
    }
  }

  export const successNoData = {
    responseType: "success",
    responseData: {
      hasRows: false
    }
  };

  export const error = {
    responseType: "error",
    responseData: {
      message: "some message",
    }
  }
}

describe('getForQuery', () => {
  it.each([
    ['success with data', Fixtures.successWithData],
    ['success with no data', Fixtures.successNoData],
    ['error', Fixtures.error]
  ])('valid %#: %s', async (_, response) => {
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(new Response(JSON.stringify(response)))
    )

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

  it.skip('missing response type', async () => {
    const response = {}
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(new Response(JSON.stringify(response)))
    )

    const result = await Api.getForQuery("connectionUrl", "query");
    const mockOnError = jest.fn()
    ResponseModel.match(
      result,
      jest.fn(),
      jest.fn(),
      mockOnError
    )
    expect(mockOnError).toHaveBeenCalled()
  })
})
