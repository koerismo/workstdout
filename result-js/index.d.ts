export type OkResult<T> = Result<T, any, true>;
export type ErrResult<T> = Result<any, T, false>;
/** Creates a new ok {@link Result} with the provided value. */
export declare const Ok: <V>(value: V) => OkResult<V>;
/** Creates a new error {@link Result} with the provided value. */
export declare const Err: <E>(error: E) => ErrResult<E>;
export type ResultType<V, E = V> = Result<V, E, true> | Result<V, E, false>;
/**
 * Represents a value and an associated `ok` value.
 */
export declare class Result<V, E = V, O extends boolean = boolean> {
    readonly ok: O;
    readonly value: O extends true ? V : E;
    constructor(ok: O, value: O extends true ? V : E);
    /**
     * Returns this Result's value if `ok`. If not, the value of this Result is thrown.
     */
    unwrap(): V | never;
    /**
     * Returns this Result's value if `ok`. If not, `value` is returned.
    */
    unwrapOr(): V | undefined;
    unwrapOr<T>(value: T): V | T;
    /**
     * Returns this Result's value if `ok`. If not, `onError` is evaluated
     * with this Result's value as a parameter, and the result is returned.
     */
    unwrapOrElse<T>(onError: (err: E) => T): V | T;
}
