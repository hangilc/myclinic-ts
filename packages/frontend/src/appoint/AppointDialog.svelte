<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { AppointTimeData } from "./appoint-time-data";
  import { format } from "kanjidate";
  import { genid } from "@/lib/genid";
  import api from "@/lib/api";
  import { Appoint, type Patient } from "myclinic-model";
  import SelectItem2 from "@/lib/SelectItem2.svelte";
  import { validateAppoint } from "@/lib/validators/appoint-validator";
  import { intSrc, Invalid, strSrc } from "@/lib/validator";
  import { setFocus } from "@/lib/set-focus";
  import { confirm } from "@/lib/confirm-call";

  export let destroy: () => void;
  export let title: string;
  export let data: AppointTimeData;
  export let init: Appoint | undefined = undefined;

  const kenshinId = genid();
  const withRegularId = genid();
  let searchText: string = "";
  let patientSearchResult: Patient[] = [];
  let patientId = 0;
  let memoInput: string = "";
  let tags: string[] = [];
  let errors: Invalid[] = [];
  let kenshinChecked: boolean = false;
  let followingChecked: boolean = false;

  $: {
    if (kenshinChecked) {
      if (!tags.includes("健診")) {
        tags.push("健診");
      }
    } else {
      tags = tags.filter((t) => t !== "健診");
    }
  }

  if (init instanceof Appoint) {
    searchText = init.patientName;
    patientId = init.patientId;
    memoInput = init.memoString;
    tags = init.tags;
    if (init.tags.includes("健診")) {
      kenshinChecked = true;
    }
  }

  function isEqualTags(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (let x of a) {
      if (!b.includes(x)) {
        return false;
      }
    }
    for (let x of b) {
      if (!a.includes(x)) {
        return false;
      }
    }
    return true;
  }

  function isModified(): boolean {
    if (init == undefined) {
      return false;
    } else {
      return !(
        searchText === init.patientName &&
        patientId === init.patientId &&
        memoInput === init.memoString &&
        isEqualTags(tags, init.tags) &&
        !followingChecked
      );
    }
  }

  function appointTimeText(data: AppointTimeData): string {
    const d = format("{M}月{D}日（{W}）", data.appointTime.date);
    const fp = parseTime(data.appointTime.fromTime);
    const f = `${fp.hour}時${fp.minute}分`;
    const up = parseTime(data.appointTime.untilTime);
    const u = `${up.hour}時${up.minute}分`;
    return `${d}${f} - ${u}`;
  }

  function parseTime(time: string): { hour: number; minute: number } {
    const parts = time.split(":");
    return {
      hour: parseInt(parts[0]),
      minute: parseInt(parts[1]),
    };
  }

  async function doPatientSearch() {
    const t = searchText.trim();
    if (t !== "") {
      const result = await api.searchPatientSmart(t);
      if (result.length === 0) {
        alert("該当患者がありません。");
      } else if (result.length === 1) {
        doPatientSelect(result[0]);
      } else {
        patientSearchResult = result;
      }
    }
  }

  function doPatientSelect(p: Patient): void {
    searchText = p.fullName();
    patientId = p.patientId;
    patientSearchResult = [];
  }

  async function enterAppoint(
    appointTimeId: number,
    tags: string[]
  ): Promise<boolean> {
    const validation = validateAppoint(0, {
      appointTimeId: intSrc(appointTimeId),
      patientName: strSrc(searchText),
      patientId: intSrc(patientId),
      memo: strSrc(Appoint.composeMemo(memoInput, tags)),
    });
    if (validation instanceof Appoint) {
      await api.registerAppoint(validation);
      return true;
    } else {
      errors = validation;
      return false;
    }
  }

  async function doNewEnter() {
    let ok: boolean = await enterAppoint(data.appointTime.appointTimeId, tags);
    if (!ok) {
      return;
    }
    if (followingChecked) {
      const following = data.followingVacant;
      if (following == undefined) {
        errors = [new Invalid("診察枠を登録できません。", [])];
      } else {
        const newTags: string[] = tags.filter((t) => t !== "健診");
        ok = await enterAppoint(following.appointTimeId, newTags);
        if (!ok) {
          return;
        }
        destroy();
      }
    } else {
      destroy();
    }
  }

  async function doUpdate(init: Appoint) {
    const validation = validateAppoint(init.appointId, {
      appointTimeId: intSrc(data.appointTime.appointTimeId),
      patientName: strSrc(searchText),
      patientId: intSrc(patientId),
      memo: strSrc(Appoint.composeMemo(memoInput, tags)),
    });
    if (validation instanceof Appoint) {
      let ok: boolean = await api.updateAppoint(validation);
      if (!ok) {
        errors = [new Invalid("変更の登録に失敗しました。", [])];
        return;
      }
      if (followingChecked) {
        const following = data.followingVacant;
        if (following == undefined) {
          errors = [new Invalid("Internal error: null followingVacant", [])];
          return;
        }
        ok = await enterAppoint(
          following.appointTimeId,
          tags.filter((t) => t !== "健診")
        );
        if (!ok) {
          return;
        }
        destroy();
      } else {
        destroy();
      }
    } else {
      errors = validation;
      return;
    }
  }

  function doEnter(): void {
    if (init == undefined) {
      doNewEnter();
    } else {
      doUpdate(init);
    }
  }

  async function doDelete() {
    if (init != undefined) {
      const appointId = init.appointId;
      confirm("この予約を削除していいですか？", async () => {
        await api.cancelAppoint(appointId);
        destroy();
      });
    }
  }

  function doClose(): void {
    destroy();
  }
</script>

<SurfaceModal {destroy} {title}>
  <div data-cy="appoint-time-text">{appointTimeText(data)}</div>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as error}
        <div>{error.toString()}</div>
      {/each}
    </div>
  {/if}
  <div class="form">
    <div class="table-row">
      <div>患者名</div>
      <div>
        <div class="patient-name-form">
          <form on:submit|preventDefault={doPatientSearch}>
            <input
              type="text"
              class="patient-search-input"
              bind:value={searchText}
              use:setFocus
              data-cy="search-patient-input"
            />
          </form>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            width="20"
            class="search-icon"
            on:click={doPatientSearch}
            data-cy="search-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {#if patientSearchResult.length > 0}
          <div class="patient-search-result">
            {#each patientSearchResult as p (p.patientId)}
              <SelectItem2
                data={p}
                isCurrent={p.patientId === patientId}
                onSelect={doPatientSelect}
              >
                {p.fullName()}
              </SelectItem2>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <div class="table-row">
      <div>患者番号</div>
      <div>
        <span data-cy="patient-id-disp">{patientId === 0 ? "" : patientId.toString()}</span>
      </div>
    </div>
    <div class="table-row">
      <div>メモ</div>
      <div>
        <input type="text" class="memo-input" bind:value={memoInput} data-cy="memo-input"/>
      </div>
    </div>
    <div class="table-row">
      <div>タグ</div>
      <div>
        <input type="checkbox" id={kenshinId} bind:checked={kenshinChecked} data-cy="kenshin-tag"/>
        <label for={kenshinId}>健診</label>
        {#if kenshinChecked && data.followingVacant != undefined}
          <input
            type="checkbox"
            id={withRegularId}
            bind:checked={followingChecked}
          />
          <label for={withRegularId}>診察も</label>
        {/if}
      </div>
    </div>
  </div>
  <div class="commands">
    {#if init != undefined}
      <button on:click={doDelete}>予約取消</button>
    {/if}
    {#if init == undefined}
      <button on:click={doEnter}>入力</button>
    {:else}
      <button on:click={doEnter}>変更入力</button>
    {/if}
    <button on:click={doClose}>キャンセル</button>
  </div>
</SurfaceModal>

<style>
  .error {
    color: red;
    margin: 10px;
  }

  .form {
    display: table;
    border-spacing: 0 4px;
  }

  .table-row {
    display: table-row;
  }

  .table-row > div {
    display: table-cell;
  }

  .table-row > div:first-of-type {
    text-align: right;
  }

  .table-row > div:nth-of-type(2) {
    padding-left: 10px;
    width: 200px;
  }

  .patient-name-form {
    display: flex;
    align-items: center;
  }

  .patient-search-result {
    margin: 10px 0;
    border: 1px solid gray;
    max-height: 6rem;
    overflow-y: auto;
  }

  .patient-search-result :global(.select-item) {
    line-height: 1;
    padding: 2px 4px;
  }

  input.patient-search-input {
    width: 8rem;
  }

  .search-icon {
    color: #999;
    margin-left: 4px;
    cursor: pointer;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-bottom: 4px;
    line-height: 1;
  }

  .commands * + button,
  .commands * + a {
    margin-left: 4px;
  }

  .commands a {
    font-size: 0.8rem;
  }
</style>
