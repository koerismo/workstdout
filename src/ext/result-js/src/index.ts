export type OkResult<T> = Result<T, any, true>;
export type ErrResult<T> = Result<any, T, false>;

/** Creates a new ok {@link Result} with the provided value. */
export const Ok = <V>(value: V): OkResult<V> => {
	return new Result(true, value);
}

/** Creates a new error {@link Result} with the provided value. */
export const Err = <E>(error: E): ErrResult<E> => {
	return new Result(false, error); 
}

export type ResultType<V, E = V> = Result<V, E, true> | Result<V, E, false>;

/**
 * Represents a value and an associated `ok` value.
 */
export class Result<V, E = V, O extends boolean = boolean> {
	constructor(
		public readonly ok: O,
		public readonly value: O extends true ? V : E
		) { }

	/**
	 * Returns this Result's value if `ok`. If not, the value of this Result is thrown.
	 */
	unwrap(): V | never {
		if (this.ok) return this.value as V;
		throw this.value;
	}

	/**
	 * Returns this Result's value if `ok`. If not, `value` is returned.
	*/
	unwrapOr(): V | undefined;
	unwrapOr<T>(value: T): V | T;
	unwrapOr<T>(value?: T): V | T {
		return this.ok ? this.value as V : value!;
	}

	/**
	 * Returns this Result's value if `ok`. If not, `onError` is evaluated
	 * with this Result's value as a parameter, and the result is returned.
	 */
	unwrapOrElse<T>(onError: (err: E) => T): V | T {
		return this.ok ? this.value as V : onError(this.value as E);
	}
}
