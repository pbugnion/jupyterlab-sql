import { Signal, ISignal } from '@lumino/signaling';

export function proxyFor<T1, T2, U>(
  source: ISignal<T1, U>,
  thisArg: T2
): Signal<T2, U> {
  const destinationSignal = new Signal<T2, U>(thisArg);
  source.connect((_, arg: U) => {
    destinationSignal.emit(arg);
  });
  return destinationSignal;
}
