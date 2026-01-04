import { Ok as _Ok, Err as _Err } from './index.js';

declare global {
	var Ok: typeof _Ok;
	var Err: typeof _Err;
}

globalThis.Ok = _Ok;
globalThis.Err = _Err;
