<script lang="ts">
  import type {
    剤形区分,
    情報区分,
    薬品コード種別,
    力価フラグ,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import type { 薬品情報, 薬品レコード } from "../denshi-shohou/presc-info";

  export let 剤形区分: 剤形区分;
  export let timesText: string;
</script>

<div>
<span>{剤形区分 === "内服" ? "日数" : "回数"}：</span>
  <input type="text" style="width:3rem" bind:value={timesText} />
  {剤形区分 === "内服" ? "日分" : "回分"}
</div>
