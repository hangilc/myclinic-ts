<script lang="ts">
  import Dialog2 from "@/lib/Dialog2.svelte";

  
  export let destroy: () => void;
</script>

<Dialog2 {destroy} title="処方例">
  <pre>院外処方
Ｒｐ）
１）プレドニン錠５ｍｇ　６錠（３－２－１）
　　@変更不可
　　@comment:副作用に注意してください
　　分３　毎食後　５日分
２）ガスター錠２０ｍｇ　２１錠
　　@患者希望
　　分３　毎食後　７日分
　　@comment:胃薬として処方
３）ムコダイン錠２５０ｍｇ　９錠
　　分３　毎食後　３日分
４）コデインリン酸塩散１％　１．５ｇ
　　分３　毎食後　３日分
５）ロキソニン錠６０ｍｇ　１回１錠
　　頭痛時　１０回分
６）サロンパス　１０枚
　　１日１回　患部に貼付　１０回分
@memo:患者の症状が改善しない場合は再診してください
@有効期限:2024-12-31
@comment:全体的なコメント（例、一包化）</pre>

  <div class="notice">
	@memo: 摘要欄に記載
  </div>
  
  <div class="commands">
	<button on:click={destroy}>閉じる</button>
  </div>
</Dialog2>

<style>
  pre {
	width: 500px;
	height: 500px;
	margin: 10px;
  }

  .notice {
	margin: 10px;
	border-top: 1px solid gray;
  }

  .commands {
	margin: 10px;
	padding: 10px;
	text-align: right;
  }
</style>
