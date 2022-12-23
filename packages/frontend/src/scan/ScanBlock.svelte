<script lang="ts">
  import { writable, type Writable } from "svelte/store";

  let scanner: Writable<string | undefined> = writable(undefined);

  function doStartScan(): void {
    console.log($scanner);
  }
</script>

<div class="top">
  <div class="title main">書類のスキャン</div>
  <div class="title">患者選択</div>
  <div class="work">
    <form>
      <input type="text" /> <button>検索</button>
    </form>
  </div>
  <div class="title">文書の種類</div>
  <div class="work">
    <input type="text" />
    <a href="javascript:void(0)">選択</a>
  </div>
  <div class="title">スキャナー</div>
  <div class="work">
    <input type="text" on:change={((e: InputEvent) => scanner.set(e.target.value))} />
    {scanner ?? "（未選択）"}
    <a href="javascript:void(0)">選択</a>
  </div>
  <div class="commands"><button on:click={doStartScan}>スキャン開始</button></div>
  <div class="title">スキャン文書</div>
  <div class="commands">
    <button>アップロード</button><button>閉じる</button>
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
