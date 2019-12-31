import {
  getDatabaseStructure,
  DatabaseStructureResponse,
  DatabaseObjects
} from '../../../src/api';

import { ServerConnection } from '@jupyterlab/services';

jest.mock('@jupyterlab/services', () => ({
  ServerConnection: {
    defaultSettings: {
      baseUrl: 'https://example.com'
    },
    makeRequest: jest.fn()
  }
}));

namespace Fixtures {
  export const databaseWithViews: DatabaseObjects = {
    tables: ['t1', 't2'],
    views: ['v1', 'v2']
  };

  export const successResponseBody: DatabaseStructureResponse.Type = {
    responseType: 'success',
    responseData: {
      tables: ['t1', 't2'],
      views: ['v1', 'v2']
    }
  }

  export const databaseWithoutViews: DatabaseObjects = {
    tables: ['t1', 't2'],
    views: []
  }

  export const successWithoutViewsResponseBody: DatabaseStructureResponse.Type = {
    responseType: 'success',
    responseData: {
      tables: ['t1', 't2']
    }
  }

  export const successWithViewsEmptyResponseBody: DatabaseStructureResponse.Type = {
    responseType: 'success',
    responseData: {
      tables: ['t1', 't2'],
      views: []
    }
  }

  export const errorResponseBody = {
    responseType: 'error',
    responseData: {
      message: 'some message'
    }
  };

  export const mockServerWithResponse = (responseBody: Object) => {
    const response: Response = new Response(JSON.stringify(responseBody))
    return jest.fn(() => Promise.resolve(response))
  }
}

describe('getDatabaseStructure', () => {
  const testCases: Array<Array<any>> = [
    ['success', Fixtures.successResponseBody],
    ['error', Fixtures.errorResponseBody]
  ];

  it.each(testCases)('valid %#: %s', async (_, responseBody) => {
    ServerConnection.makeRequest = Fixtures.mockServerWithResponse(responseBody)

    const result = await getDatabaseStructure('connectionUrl');
    expect(result).toEqual(responseBody);
    const expectedUrl = 'https://example.com/jupyterlab-sql/database';
    const expectedRequest = {
      method: 'POST',
      body: JSON.stringify({ connectionUrl: 'connectionUrl' })
    };

    expect(ServerConnection.makeRequest).toHaveBeenCalledWith(
      expectedUrl,
      expectedRequest,
      ServerConnection.defaultSettings
    );
  });

  const successTestCases: Array<Array<any>> = [
    ['with views', Fixtures.databaseWithViews, Fixtures.successResponseBody],
    ['no views', Fixtures.databaseWithoutViews, Fixtures.successWithoutViewsResponseBody],
    ['empty views', Fixtures.databaseWithoutViews, Fixtures.successWithViewsEmptyResponseBody]
  ]
  it.each(successTestCases)('matching on success %#: %s', async (_, expected, responseBody) => {
    ServerConnection.makeRequest = Fixtures.mockServerWithResponse(responseBody);

    const result = await getDatabaseStructure('connectionUrl');

    const mockOnSuccess = jest.fn();
    DatabaseStructureResponse.match(result, mockOnSuccess, jest.fn());

    expect(mockOnSuccess).toHaveBeenCalledWith(expected);
  });

  it('matching on error', async () => {
    ServerConnection.makeRequest = Fixtures.mockServerWithResponse(Fixtures.errorResponseBody);

    const result = await getDatabaseStructure('connectionUrl');

    const mockOnError = jest.fn();
    DatabaseStructureResponse.match(result, jest.fn(), mockOnError);

    expect(mockOnError).toHaveBeenCalledWith(Fixtures.errorResponseBody.responseData);
  });

  it('bad http status code', async () => {
    ServerConnection.makeRequest = jest.fn(() =>
      Promise.resolve(new Response('', { status: 400 }))
    );
    const result = await getDatabaseStructure('connectionUrl');
    const mockOnError = jest.fn();
    DatabaseStructureResponse.match(result, jest.fn(), mockOnError);
    expect(mockOnError).toHaveBeenCalled();
    const [[{ message }]] = mockOnError.mock.calls;
    expect(message).toMatch(/response status/);
  });
});
