<script lang="ts">
  import Dialog2 from "@/lib/Dialog2.svelte";
  import type { PrescInfoData } from "../denshi-shohou/presc-info";
  import { writable, type Writable } from "svelte/store";
  import PrescRep from "./PrescRep.svelte";

  export let destroy: () => void;
  export let src: PrescInfoData;

  let data: Writable<PrescInfoData> = writable(src);
</script>

<Dialog2 title="電子処方箋編集" {destroy} width="500px" height="600px">
  <div class="top">
    <div class="rep"><PrescRep {data} /></div>
	<div class="form">FORM</div>
  </div>
</Dialog2>

<style>
  .top {
	display: grid;
	grid-template-columns: 30% 1fr;
	gap: 10px;
	padding: 10px;
	overflow-y: auto;
  }
</style>
