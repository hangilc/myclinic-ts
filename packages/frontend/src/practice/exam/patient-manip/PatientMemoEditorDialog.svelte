<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { PatientMemo } from "myclinic-model/model";

  export let destroy: () => void;
  export let memo: string | undefined;
  export let onEnter: (newMemo: PatientMemo) => void;
  let memoValue = createMemoValue(memo);
  let error: string | undefined = undefined;

  function createMemoValue(memo: string | undefined): string {
    let value = {
      "onshi-name": undefined,
      "rezept-name": undefined,
      "main-disease": undefined,
	  "email": undefined,
    };
    if (memo !== undefined) {
      const m = JSON.parse(memo);
      value = Object.assign(value, m);
    }
    return JSON.stringify(value, (_k, v) => (v === undefined ? null : v), 2);
  }

  type ValidationResult =
    | {
        ok: true;
        value: PatientMemo;
      }
    | {
        ok: false;
        error: string;
      };

  function validateMemo(input: string): ValidationResult {
    if( input.trim() === "" ){
      input = "{}";
    }
    try {
      const json = JSON.parse(input);
      const keys = Object.keys(json);
      const validKeys = ["onshi-name", "rezept-name", "main-disease", "email"];
      for (let key of keys) {
        if (!validKeys.includes(key)) {
          return {
            ok: false,
            error: `invalid key: ${key}`,
          };
        }
        let v = json[key];
        if (v === null) {
          json[key] = undefined;
        } else if (v === undefined || typeof v === "string") {
          // nop
        } else {
          return {
            ok: false,
            error: `unexpected entry (string or undefined expected): ${key}: ${v}`,
          };
        }
      }
      return {
        ok: true,
        value: json,
      };
    } catch (ex) {
      return {
        ok: false,
        error: "invalid JSON",
      };
    }
  }

  function doEnter(): void {
    const result = validateMemo(memoValue);
    if (!result.ok) {
      error = result.error;
    } else {
      destroy();
      onEnter(result.value);
    }
  }

  function doClose(): void {
    destroy();
  }
</script>

<Dialog title="患者メモ編集" destroy={doClose}>
  <div class="main">
    <textarea bind:value={memoValue} />
  </div>
  {#if error}
    <div style="margin: 10px 0;color:red;padding:10px;">
      {error}
    </div>
  {/if}
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .main textarea {
    width: 300px;
    height: 300px;
    font-size: 14px;
  }

  .commands {
    display: flex;
    justify-content: right;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
