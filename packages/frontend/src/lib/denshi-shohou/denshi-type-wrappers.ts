import type { 不均等レコード } from "./presc-info";

export class 不均等レコードWrapper {
  data: 不均等レコード;

  constructor(data: 不均等レコード) {
	this.data = data;
  }

  getParts(): string[] {
    let r = this.data;
	let parts: string[] = [r.不均等１回目服用量, r.不均等２回目服用量];
	[
	  r.不均等３回目服用量,
	  r.不均等４回目服用量,
	  r.不均等５回目服用量,
	].forEach((e) => {
	  if (e) {
		parts.push(e);
	  }
	});
    return parts;
  }

}
