<script lang="ts">
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";
  import api from "@/lib/api"

  let startDate: Date = new Date();
  let searchText: string = "";
  let searchResult;

  async function doSearch() {
    const t = searchText.trim();
    if( t !== "" && startDate != null ){
      searchResult = await api.searchByoumeiMaster(t, startDate);
      console.log(searchResult);
    }
  }
</script>

<div>
  <div>名称：</div>
  <div>
    <EditableDate bind:date={startDate}>
      <svelte:fragment slot="icons">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="choice-icon"
          width="1.2em"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </svelte:fragment>
    </EditableDate>
  </div>
  <div>
    <button>入力</button>
    <a href="javascript:void(0)">の疑い</a>
    <a href="javascript:void(0)">修飾語削除</a>
  </div>
  <div>
    <form class="search-form" on:submit|preventDefault={doSearch}>
      <input type="text" class="search-text-input" bind:value={searchText} />
      <button type="submit">検索</button>
    </form>
    <a href="javascript:void(0)">例</a>
  </div>
  <div>
    <input type="radio" checked/>病名
    <input type="radio">修飾語
  </div>
  <div>
    <div class="search-result select">

    </div>
  </div>
</div>

<style>
  .choice-icon {
    color: gray;
    cursor: pointer;
  }

  .search-form {
    display: inline-block;
  }

  .search-text-input {
    width: 8em;
  }

  .search-result {
    height: 8em;
    overflow-y: auto;
  }
</style>
