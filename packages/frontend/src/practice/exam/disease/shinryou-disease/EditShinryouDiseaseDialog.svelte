<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { type Requirement, type ShinryouDisease } from "@/lib/shinryou-disease";
  import RequirementForm from "./RequirementForm.svelte";

  export let destroy: () => void;
  export let title: string;
  export let orig: ShinryouDisease;
  export let at: string;
  export let onEnter: (item: ShinryouDisease) => void;
  export let onCancel: () => void;
  
  let shinryouName: string = orig.shinryouName;
  let reqPartSeq = 0;
  let reqParts: {
	id: number;
	req: Requirement;
	editing: boolean;
  }[] = [];
  if( orig.kind === "disease-check" ){
	reqParts.push({ id: reqPartSeq++, req: orig, editing: false });
  } else if( orig.kind === "multi-disease-check" ) {
	let parts = orig.requirements.map(req => ({ id: reqPartSeq++, req, editing: false }));
	reqParts.push(...parts);
  }

  function doEnter() {
	if( reqParts.length === 0 ){
	  onEnter({
		id: orig.id,
		shinryouName,
		kind: "no-check",
	  })
	} else if( reqParts.length === 1 ){
	  const req = reqParts[0].req;
	  console.log("req", req);
	  onEnter({
		id: orig.id,
		shinryouName,
		kind: "disease-check",
		diseaseName: req.diseaseName,
		fix: req.fix,
	  });
	} else {
	  const reqs = reqParts.map(p => p.req);
	  onEnter({
		id: orig.id,
		shinryouName,
		kind: "multi-disease-check",
		requirements: reqs,
	  })
	}
  }


  function doReqEntered(partId: number, entered: Requirement) {
	for(let part of reqParts){
	  if( part.id === partId ){
		part.req = entered;
		part.editing = false;
		reqParts = reqParts;
		break;
	  }
	}
  }
  
  function reqRep(req: Requirement): string {
	if( req.diseaseName ){
	let s = req.diseaseName;
	if( req.fix ){
	  let f = req.fix.diseaseName;
	  if( req.fix.adjNames.length > 0 ){
		let adj = req.fix.adjNames.join("、");
		f += ` (${adj})`;
	  }
	  s += `|${f}`;
	}
	  return s;
	} else {
	  return "(未設定)";
	}
  }

  function doCancel() {
	onCancel();
  }

  function doAdd() {
	let newReq = {
	  diseaseName: "",
	}
	reqParts.push({
	  id: reqPartSeq++,
	  req: newReq,
	  editing: true,
	});
	reqParts = reqParts;
  }
  
</script>

<Dialog {title} {destroy} styleWidth="300px">
  <div class="row">
    診療行為名：{shinryouName}
  </div>
  {#each reqParts as part (part.id)} 
  <div class="req">
	<div>{reqRep(part.req)}</div>
	<div>
	  <button on:click={() => part.editing = !part.editing}>編集</button>
	  <button>削除</button>
  </div>
  {#if part.editing}
	<RequirementForm src={part.req} at={at}
	  onEnter={entered => doReqEntered(part.id, entered)}
	  onCancel={() => part.editing = false}/>
  {/if}
  </div>
  {/each}
  <div>
	<button on:click={doAdd}>追加</button>
  </div>
  <div>
	<button on:click={doEnter}>入力</button>
	<button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog>

<style>
  .row {
    margin: 4px 0;
  }

  .req {
	border: 1px solid gray;
  }
</style>
