
export namespace ResponseModel {
  export type Type = ErrorResponse | SuccessResponse;

  interface ErrorResponse {
    responseType: 'error';
    responseData: ErrorResponseData;
  }

  interface SuccessResponse {
    responseType: 'success';
    responseData: SuccessResponseData;
  }

  interface ErrorResponseData {
    message: string;
  }

  type SuccessResponseData =
    | {
      hasRows: false;
    }
    | {
      hasRows: true;
      keys: Array<string>;
      rows: Array<Array<any>>;
    };

  export function createError(message: string): ErrorResponse {
    return {
      responseType: 'error',
      responseData: {
        message
      }
    };
  }

  export function match<U>(
    response: Type,
    onSuccessWithRows: (keys: Array<string>, rows: Array<Array<any>>) => U,
    onSuccessNoRows: () => U,
    onError: (_: ErrorResponseData) => U
  ): U {
    if (response.responseType === 'error') {
      return onError(response.responseData);
    } else if (response.responseType === 'success') {
      const responseData = response.responseData;
      if (responseData.hasRows) {
        const { keys, rows } = responseData;
        return onSuccessWithRows(keys, rows);
      } else {
        return onSuccessNoRows();
      }
    }
  }
}

export namespace StructureResponse {
  export type Type = ErrorResponse | SuccessResponse;

  interface ErrorResponse {
    responseType: 'error';
  }

  interface SuccessResponse {
    responseType: 'success';
    responseData: SuccessResponseData;
  }

  type SuccessResponseData = {
    tables: Array<string>;
  }

  export function match<U>(
    response: Type,
    onSuccess: (tables: Array<string>) => U,
    onError: () => U
  ) {
    if (response.responseType === 'error') {
      return onError();
    } else if (response.responseType === 'success') {
      const { tables } = response.responseData;
      return onSuccess(tables);
    }
  }
}

// TODO tests
export namespace TableStructureResponse {
  export type Type = ErrorResponse | SuccessResponse;

  interface ErrorResponse {
    responseType: 'error';
  }

  interface SuccessResponse {
    responseType: 'success';
    responseData: SuccessResponseData;
  }

  type SuccessResponseData = {
    keys: Array<string>;
    rows: Array<Array<any>>;
  }

  export function match<U>(
    response: Type,
    onSuccess: (keys: Array<string>, rows: Array<Array<any>>) => U,
    onError: () => U
  ): U {
    if (response.responseType === 'error') {
      return onError()
    } else if (response.responseType === 'success') {
      const { keys, rows } = response.responseData;
      return onSuccess(keys, rows)
    }
  }
}
