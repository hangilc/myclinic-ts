<script lang="ts">
  import type { HouseVisit } from "@/lib/drawer/forms/ryouyouhi-douisho/ryouyouhi-douisho-drawer";

  export let values: HouseVisit;

</script>

<div>
  <div class="title">往療</div>

  <div class="section">
    <div class="required-section">
      <label>
        <input type="radio" bind:group={values.required} value={true} />
        １．必要とする
      </label>
      <label>
        <input type="radio" bind:group={values.required} value={false} />
        ２．必要としない
      </label>
    </div>

    <div class="kaigodo-section">
      <label class="kaigodo-label">
        介護保険の要介護度：
        <input
          type="text"
          bind:value={values.kaigodo}
          placeholder="要介護度を入力"
        />
      </label>
    </div>

    {#if values.required}
      <div class="reason-section">
        <div class="subtitle">往療を必要とする理由</div>

        <div class="reason-options">
          <div>
            <label>
              <input type="radio" value={1} bind:group={values.reason} />
              １．独歩による公共交通機関を使っての外出が困難
            </label>
          </div>

          <div>
            <label>
              <input type="radio" value={2} bind:group={values.reason} />
              ２．認知症や視覚、内部、精神障害などにより単独での外出が困難
            </label>
          </div>

          <div>
            <label>
              <input type="radio" value={3} bind:group={values.reason} />
              ３．その他
            </label>
          </div>

          {#if values.reason === 3}
            <div class="other-reason">
              <input
                type="text"
                bind:value={values.reasonString}
                placeholder="その他の理由を入力してください"
              />
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .title {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .section {
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #fafafa;
  }
  .required-section {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .kaigodo-section {
    margin-bottom: 1rem;
  }

  .kaigodo-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .reason-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #ddd;
  }

  .subtitle {
    margin-bottom: 1rem;
    color: #333;
  }

  input[type="text"] {
    padding: 0.25rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 0.9em;
  }

  /*

  .reason-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .other-reason {
    margin-left: 1.5rem;
    margin-top: 0.5rem;
  }

  label {
    display: flex;
    align-items: flex-start;
    cursor: pointer;
    padding: 0.25rem 0;
    gap: 0.5rem;
  }

  input[type="radio"] {
    margin-right: 0.5rem;
    margin-top: 0.1rem;
    flex-shrink: 0;
  }

  input[type="text"] {
    padding: 0.25rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 0.9em;
  }

  .kaigodo-label input[type="text"] {
    width: 8rem;
  }

  .other-reason input[type="text"] {
    width: 100%;
    max-width: 400px;
  }

  .reason-options label {
    line-height: 1.4;
  } */
</style>
