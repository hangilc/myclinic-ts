<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { Requirement, ShinryouDisease } from "@/lib/shinryou-disease";
  import type { ByoumeiMaster, ShuushokugoMaster } from "myclinic-model";
  import RequirementForm from "./RequirementForm.svelte";

  export let destroy: () => void;
  export let title: string;
  export let orig: ShinryouDisease;
  export let at: string;
  export let onEnter: (item: ShinryouDisease) => void;
  
  let shinryouName: string = orig.shinryouName;
  let kind: "disease-check" | "no-check" | "multi-disease-check" = orig.kind;
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
  let searchMode: "byoumei" | "shuushokugo" = "byoumei";
  let searchText = "";
  let byoumeiResult: ByoumeiMaster[] = [];
  let adjResult: ShuushokugoMaster[] = [];

  function doEnter() {
    // shinryouName = shinryouName.trim();
    // if (shinryouName !== "") {
    //   switch (kind) {
    //     case "no-check": {
    //       destroy();
    //       onEnter({
    //         shinryouName,
    //         kind,
    //       });
    //       break;
    //     }
    //     case "disease-check": {
    //       const inputs = diseaseCheckInputs;
    //       if (inputs.diseaseName === "") {
    //         alert("病名が設定されていません。");
    //         return;
    //       }
    //       let fix: { diseaseName: string; adjNames: string[] } | undefined =
    //         undefined;
    //       if (inputs.fixDiseaseName === "" && inputs.fixAdjNames.length > 0) {
    //         alert("Ｆｉｘ病名が設定されていません。");
    //         return;
    //       }
    //       if (inputs.fixDiseaseName !== "") {
    //         fix = {
    //           diseaseName: inputs.fixDiseaseName,
    //           adjNames: inputs.fixAdjNames,
    //         };
    //       }
    //       destroy();
    //       onEnter({
    //         shinryouName,
    //         kind,
    //         diseaseName: inputs.diseaseName,
    //         fix,
    //       });
    //     }
    //   }
    // }
  }

  // async function doSearch() {
  //   searchText = searchText.trim();
  //   if (searchText !== "") {
  //     byoumeiResult = [];
  //     adjResult = [];
  //     if (searchMode === "byoumei") {
  //       byoumeiResult = await api.searchByoumeiMaster(searchText, at);
  //     } else if (searchMode === "shuushokugo") {
  //       adjResult = await api.searchShuushokugoMaster(searchText, at);
  //     }
  //   }
  // }

  // function doByoumeiSelect(m: ByoumeiMaster) {
  //   if (kind === "disease-check") {
  //     diseaseCheckInputs.diseaseName = m.name;
  //     diseaseCheckInputs.fixDiseaseName = m.name;
  //     diseaseCheckInputs = diseaseCheckInputs;
  //     searchText = "";
  //     searchMode = "shuushokugo";
  //     byoumeiResult = [];
  //   }
  // }

  // function doAdjSelect(m: ShuushokugoMaster) {
  //   if (kind === "disease-check") {
  //     diseaseCheckInputs.fixAdjNames.push(m.name);
  //     diseaseCheckInputs = diseaseCheckInputs;
  //     adjResult = [];
  //   }
  // }

  function reqRep(req: Requirement): string {
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
		<RequirementForm src={part.req} at={at} onEnter={() => {}}
		  onCancel={() => part.editing = false}/>
	  {/if}
	</div>
  {/each}
</Dialog>

<style>
  .row {
    margin: 4px 0;
  }

  .req {
	border: 1px solid gray;
  }

</style>
