
export type IPromiseState<R> =
    | {isLoading: true, error: null, value: null}
    | {isLoading: false, error: Error, value: null}
    | {isLoading: false, error: null, value: R};
