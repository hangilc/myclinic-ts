<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import api from "@/lib/api";

  export let destroy: () => void;
  export let to: string;
  export let from: string;
  export let subject: string;
  export let content: string;

  function doClose() {
    destroy();
  }

  function doCancel() {
	doClose();
  }

  async function doSend() {
	let m = {
	  to, from, subject, content
	};
	await api.sendmail(m);
	destroy();
  }
</script>

<Dialog title="メール送信" destroy={doClose}>
  <div>
    To: <input type="text" bind:value={to} />
  </div>
  <div>
    From: <input type="text" bind:value={from} />
  </div>
  <div>
    Subject: <input type="text" bind:value={subject} />
  </div>
  <div class="content">
	Content:
	<div>
	  <textarea bind:value={content} />
	</div>
  </div>
  <div>
	<button on:click={doSend}>送信</button>
	<button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog>

<style>
  .content textarea {
	width: 340px;
	height: 400px;
	resize: both;
	font-size: 14px;
  }
</style>
