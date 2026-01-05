# Result
A minimal Result interface for TypeScript in a 300-byte package.

## Example

```ts
import { Ok, Err } from '@koerismo/result';

// Or, use the globals:
// import '@koerismo/result/global';


// Define a sketchy function...
function errorProneFunc(i: number) {
	if (i <= 0.1)  return Err(-1);
	else           return Ok(Math.round(i * 100));
}

// Throw a random number at it...
const result = errorProneFunc(Math.random());


// The result can be checked by accessing the "ok" property:
if (result.ok)  console.log('Result is okay!');
else            console.log('Result is error!');

// But maybe the result is usable even with an error:
console.log('Either Value:', result.value);

// The value can be unwrapped with a fallback via .unwrapOr(...):
console.log('Value or Fallback:', result.unwrapOr('john fallback'));

// .unwrap() Throws (-1) if the function returned Err(-1).
console.log('Correct Value:', result.unwrap());
```
