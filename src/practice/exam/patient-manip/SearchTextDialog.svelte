<script lang="ts">
    import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { Text } from "@/lib/model";

  export let patientId: number;
  let texts: Text[] = [];
  const nPerPage = 10;
  let totalPage: number = 0;
  let dialog: Dialog

  async function open() {
    await load(0);
    dialog.open();
  }

  async function load(page: number) {
    texts = await api.searchTextForPatient(text, patientId, nPerPage, nPerPage * page);
  }
</script>

<Dialog let:close bind:this={dialog}>
  <span slot="title">文章検索</span>
  <div>

  </div>
  {#each texts as t (t.textId)}
    <div>
      {t.content}
    </div>
  {/each}
</Dialog>
