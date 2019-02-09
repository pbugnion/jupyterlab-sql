import {
  SingletonLayout, Widget, LayoutItem
} from '@phosphor/widgets';

import {
  DataModel, DataGrid
} from '@phosphor/datagrid';

import {
  Message
} from '@phosphor/messaging';


namespace Responses {
  export type Type = ErrorResponse | SuccessResponse

  interface ErrorResponse {
    responseType: "error",
    responseData: ErrorResponseData
  }

  interface SuccessResponse {
    responseType: "success",
    responseData: SuccessResponseData
  }

  interface ErrorResponseData {
    message: string
  }

  type SuccessResponseData = {
      hasRows: false
    } | {
      hasRows: true,
      keys: Array<string>,
      rows: Array<Array<any>>
    }

  export function match<U>(
    response: Type,
    onSuccessWithRows: (keys: Array<string>, rows: Array<Array<any>>) => U,
    onSuccessNoRows: () => U,
    onError: (_: ErrorResponseData) => U
  ): U {
    if (response.responseType === "error") {
      return onError(response.responseData)
    } else if (response.responseType === "success") {
      const responseData = response.responseData
      if (responseData.hasRows) {
        const { keys, rows } = responseData
        return onSuccessWithRows(keys, rows)
      } else {
        return onSuccessNoRows()
      }
    }
  }
}


class SqlDataModel extends DataModel {
  constructor(keys: Array<string>, data: Array<Array<any>>) {
    super()
    this._data = data
    this._keys = keys
  }

  readonly _data: any
  readonly _keys: any

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? this._data.length : 1
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? this._keys.length : 1
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === "row-header") {
      return row;
    }
    if (region === "column-header") {
      return this._keys[column];
    }
    if (region === "corner-header") {
      return "";
    }
    return this._serializeData(this._data[row][column]);
  }

  _serializeData(data: any): any {
    const _type = typeof data
    if (_type === "object") {
      return JSON.stringify(data)
    }
    return data
  }
}


class TextResponseWidget extends Widget {
  constructor(message: string) {
    super();
    const element = document.createElement("div")
    const pre = document.createElement("pre")
    pre.innerHTML = message
    element.appendChild(pre);
    this.node.appendChild(element);
  }
}


export class ResponseWidget extends Widget {
  constructor() {
    super();
    this.layout = new SingletonLayout();
  }

  readonly layout: SingletonLayout;
  private item: LayoutItem

  setCurrentWidget(widget: Widget) {
    this.layout.widget = widget
    this.item = new LayoutItem(this.layout.widget);
    this.fitCurrentWidget();
  }

  onResize(msg: Message) {
    if (this.item) {
      this.fitCurrentWidget()
    }
  }

  fitCurrentWidget() {
    this.item.update(
      0, 0,
      this.node.offsetWidth,
      this.node.offsetHeight
    )
  }

  setResponse(response: Responses.Type) {
    Responses.match(
      response,
      (keys, rows) => {
        const model = new SqlDataModel(keys, rows)
        const gridWidget = new DataGrid();
        gridWidget.model = model;
        this.setCurrentWidget(gridWidget);
      },
      () => {
        const message = "Command executed successfully";
        const errorResponseWidget = new TextResponseWidget(message);
        this.setCurrentWidget(errorResponseWidget);
      },
      ({ message }) => {
        const errorResponseWidget = new TextResponseWidget(message);
        this.setCurrentWidget(errorResponseWidget);
      }
    )
  }
}
