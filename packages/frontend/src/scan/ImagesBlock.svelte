<script lang="ts">
  export let remove: () => void;
  let patientId: number = 0;
  let patientText: string = "（未選択）";

  function doSelectPatient(): void {

  }

  function doClose(): void {
    remove();
  }
</script>

<div class="top">
  <div class="title main">保存画像</div>
  <div class="title">患者選択</div>
  <div class="work">
    {patientText}
    <a href="javascript:void(0)" on:click={doSelectPatient}>選択</a>
  </div>
  <div class="commands">
    <button on:click={doClose}>閉じる</button>
  </div>
</div>

<style>
  .top {
    margin: 10px;
    padding: 10px;
    border: 1px solid gray;
  }

  .title {
    font-weight: bold;
    margin: 10px 0;
  }

  .main {
    font-size: 1.2rem;
  }

  .work {
    margin: 0 10px;
  }

  .commands {
    margin: 10px 0;
  }

  * + button {
    margin-left: 4px;
  }
</style>
