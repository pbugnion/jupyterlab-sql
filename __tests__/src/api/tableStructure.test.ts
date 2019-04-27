
import { getTableStructure, TableStructureResponse } from '../../../src/api';

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

describe('getTableStructure', () => {
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

  it('matching on success', async () => {
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(new Response(JSON.stringify(Fixtures.success)))
    )

    const result = await getTableStructure('connectionUrl', 'tableName');

    const mockOnSuccess = jest.fn();
    TableStructureResponse.match(
      result,
      mockOnSuccess,
      jest.fn()
    )

    expect(mockOnSuccess).toHaveBeenCalledWith(
      Fixtures.success.responseData.keys,
      Fixtures.success.responseData.rows
    );
  })

  it('matching on error', async () => {
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(new Response(JSON.stringify(Fixtures.error)))
    )

    const result = await getTableStructure('connectionUrl', 'tableName');

    const mockOnError = jest.fn();
    TableStructureResponse.match(
      result,
      jest.fn(),
      mockOnError
    )

    expect(mockOnError).toHaveBeenCalledWith(Fixtures.error.responseData);
  })

  it('bad http status code', async () => {
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(new Response('', { status: 400 }))
    )
    const result = await getTableStructure('connectionUrl', 'tableName');
    const mockOnError = jest.fn()
    TableStructureResponse.match(
      result,
      jest.fn(),
      mockOnError
    )
    expect(mockOnError).toHaveBeenCalled();
  })
})
