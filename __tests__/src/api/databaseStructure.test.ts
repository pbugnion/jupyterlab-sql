
import { getStructure, StructureResponse } from '../../../src/api';

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
      tables: ['t1', 't2']
    }
  }

  export const successResponse = new Response(JSON.stringify(success));

  export const error = {
    responseType: "error",
    responseData: {
      message: "some message",
    }
  }
}

describe('getDatabaseStructure', () => {
  it.each([
    ['success', Fixtures.success],
    ['error', Fixtures.error]
  ])('valid %#: %s', async (_, response) => {
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(new Response(JSON.stringify(response)))
    )

    const result = await getStructure('connectionUrl');
    expect(result).toEqual(response);
    const expectedUrl = "https://example.com/jupyterlab-sql/structure";
    const expectedRequest = {
      method: 'POST',
      body: JSON.stringify({ connectionUrl: 'connectionUrl' })
    };

    expect(ServerConnection.makeRequest).toHaveBeenCalledWith(
      expectedUrl, expectedRequest, ServerConnection.defaultSettings
    );
  })

  it('matching on success', async () => {
    ServerConnection.makeRequest = jest.fn(
      () => Promise.resolve(Fixtures.successResponse)
    )

    const result = await getStructure('connectionUrl');

    const mockOnSuccess = jest.fn();
    StructureResponse.match(
      result,
      mockOnSuccess,
      jest.fn()
    )

    expect(mockOnSuccess).toHaveBeenCalledWith(
      Fixtures.success.responseData.tables
    );
  })
})
