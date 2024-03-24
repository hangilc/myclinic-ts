<script lang="ts">
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";
  import { defaultDates, probeFaxShohousen, type FaxShohousen } from "./fax-shohousen-helper";
  import api from "@/lib/api";
  import { dateToSqlDate } from "myclinic-model";

  let [fromDate, uptoDate] = defaultDates(new Date());
  let labelStartRow = 1;
  let labelStartCol = 1;

  async function doCreate() {
    const visitIds = await api.listVisitIdInDateInterval(
      dateToSqlDate(fromDate), dateToSqlDate(uptoDate)
    );
    const fs: FaxShohousen[] = [];
    for(let visitId of visitIds) {
      const f = await probeFaxShohousen(visitId);
      if( f ){
        fs.push(f);
      }
    }
    console.log(fs);
  }

</script>

<div class="title">ファックス済処方箋</div>
<form>
  <div>
      <span>開始日</span>
      <EditableDate date={fromDate} />
      <span class="ml-2">終了日</span>
      <EditableDate date={uptoDate} />
  </div>
  <div>
      <span>ラベル開始</span>
      <label>行</label>
      <input type="number" class="label-input" bind:value={labelStartRow}/>
      <label>列</label>
      <input type="number" class="label-input" bind:value={labelStartCol}/>
  </div>
  <div class="form-inline mt-2">
      <button type="button" on:click={doCreate}>すべて作成</button>
  </div>
</form>

<div id="faxed-progress-report" class="alert alert-info alert-dismissible my-3 d-none" role="alert">
  <div class="faxed-part-message"></div>
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
  </button>
</div>

<div id="faxed-error-report" class="card mt-3 d-none">
  <div class="card-header text-white bg-danger">エラー</div>
  <div class="card-body"></div>
</div>

<div id="faxed-data-file-status" class="faxed-group-status card mt-3">
  <div class="card-header">データ</div>
  <div class="card-body">
      <div class="faxed-part-message"></div>
      <div class="form-inline mt-2">
          <button type="button" class="btn btn-link faxed-part-create">作成</button>
      </div>
  </div>
</div>

<div id="faxed-shohousen-pdf-status" class="faxed-group-status card mt-3">
  <div class="card-header">処方箋ＰＤＦ</div>
  <div class="card-body">
      <div class="faxed-part-message"></div>
      <div class="form-inline mt-2">
          <button type="button" class="btn btn-link faxed-part-create">作成</button>
          <button type="button" class="btn btn-link faxed-part-display">表示</button>
      </div>
  </div>
</div>

<div id="faxed-pharma-letter-pdf-status" class="faxed-group-status card mt-3">
  <div class="card-header">薬局レターＰＤＦ</div>
  <div class="card-body">
      <div class="faxed-part-message"></div>
      <div class="form-inline mt-2">
          <button type="button" class="btn btn-link faxed-part-create">作成</button>
          <button type="button" class="btn btn-link faxed-part-display">表示</button>
      </div>
  </div>
</div>

<div id="faxed-pharma-label-pdf-status" class="faxed-group-status card mt-3">
  <div class="card-header">薬局住所ラベルＰＤＦ</div>
  <div class="card-body">
      <div class="faxed-part-message"></div>
      <div class="form-inline mt-2">
          <button type="button" class="btn btn-link faxed-part-create">作成</button>
          <button type="button" class="btn btn-link faxed-part-display">表示</button>
      </div>
  </div>
</div>

<div id="faxed-clinic-label-pdf-status" class="faxed-group-status card mt-3">
  <div class="card-header">クリニック住所ラベルＰＤＦ</div>
  <div class="card-body">
      <div class="faxed-part-message"></div>
      <div class="form-inline mt-2">
          <button type="button" class="btn btn-link faxed-part-create">作成</button>
          <button type="button" class="btn btn-link faxed-part-display">表示</button>
      </div>
  </div>
</div>

<ul class="nav nav-tabs mt-3">
  <li class="nav-item">
      <a class="nav-link faxed-part-prev-groups" href="javascript:void(0)">処理済一覧</a>
  </li>
</ul>
<div id="faxed-nav-content-prev-groups" class="faxed-nav-content d-none"></div>

<style>
  .title {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  .label-input {
    width: 4em;
  }
</style>