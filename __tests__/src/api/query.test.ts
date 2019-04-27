
import { getForQuery, ResponseModel } from '../../../src/api';

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

    const result = await getForQuery("connectionUrl", "query");
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

  it('matching on success with data', async () => {
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(new Response(JSON.stringify(Fixtures.successWithData)))
    )

    const result = await getForQuery('connectionUrl', 'query');

    const mockOnSuccessWithData = jest.fn();
    ResponseModel.match(
      result,
      mockOnSuccessWithData,
      jest.fn(),
      jest.fn()
    )

    expect(mockOnSuccessWithData).toHaveBeenCalledWith(
      Fixtures.successWithData.responseData.keys,
      Fixtures.successWithData.responseData.rows
    )
  })

  it('matching on success with no data', async () => {
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(new Response(JSON.stringify(Fixtures.successNoData)))
    )

    const result = await getForQuery('connectionUrl', 'query');

    const mockOnSuccessNoData = jest.fn();
    ResponseModel.match(
      result,
      jest.fn(),
      mockOnSuccessNoData,
      jest.fn()
    )

    expect(mockOnSuccessNoData).toHaveBeenCalled()
  })

  it('matching on error', async () => {
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(new Response(JSON.stringify(Fixtures.error)))
    )

    const result = await getForQuery('connectionUrl', 'query');

    const mockOnError = jest.fn();
    ResponseModel.match(
      result,
      jest.fn(),
      jest.fn(),
      mockOnError,
    )

    expect(mockOnError).toHaveBeenCalledWith(Fixtures.error.responseData)
  })

  it('missing response type', async () => {
    const response = {}
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(new Response(JSON.stringify(response)))
    )

    const result = await getForQuery("connectionUrl", "query");
    const mockOnError = jest.fn()
    ResponseModel.match(
      result,
      jest.fn(),
      jest.fn(),
      mockOnError
    )
    expect(mockOnError).toHaveBeenCalled()
    const [[{ message }]] = mockOnError.mock.calls
    expect(message).toMatch(/validation error/);
  })

  it('bad http status code', async () => {
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(new Response('', { status: 400 }))
    )
    const result = await getForQuery("connectionUrl", "query");
    const mockOnError = jest.fn()
    ResponseModel.match(
      result,
      jest.fn(),
      jest.fn(),
      mockOnError
    )
    expect(mockOnError).toHaveBeenCalled()
    const [[{ message }]] = mockOnError.mock.calls
    expect(message).toMatch(/response status/);
  })
})
