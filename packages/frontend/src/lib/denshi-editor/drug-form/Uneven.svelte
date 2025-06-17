<script lang="ts">
  import type { 不均等レコード } from "@/lib/denshi-shohou/presc-info";

  export let 不均等レコード: 不均等レコード | undefined;
  let inputText: string = serialize(不均等レコード);

  function serialize(r: 不均等レコード| undefined): string {
	if( r ) {
	  let parts: string[] = [r.不均等１回目服用量, r.不均等２回目服用量];
	  [r.不均等３回目服用量, r.不均等４回目服用量, r.不均等５回目服用量].forEach(e => {
		if( e ){
		  parts.push(e);
		}
	  });
	  return parts.join("-");
	} else {
	  return "";
	}
  }
</script>

不均等：<input type="text">
