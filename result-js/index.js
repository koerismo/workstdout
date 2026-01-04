export const Ok=e=>new Result(!0,e),Err=e=>new Result(!1,e);export class Result{constructor(r,t){this.ok=r;this.value=t}unwrap(){if(this.ok)return this.value;throw this.value}unwrapOr(r){return this.ok?this.value:r}unwrapOrElse(r){return this.ok?this.value:r(this.value)}}
//# sourceMappingURL=index.js.map
