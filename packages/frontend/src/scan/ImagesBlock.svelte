<script lang="ts">
  import api from "@/lib/api";
  import { extractPatientImageDate } from "@/lib/extract-patient-image-data";
  import ImageDialog from "@/lib/ImageDialog.svelte";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import { sortPatientImages } from "@/lib/sort-patient-images";

  export let remove: () => void;
  let patientId: number = 0;
  let patientText: string = "（未選択）";
  let images: string[] = [];

  function doSelectPatient(): void {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者選択（保存画像）",
        onEnter: async (p) => {
          patientId = p.patientId;
          patientText = `(${p.patientId}) ${p.fullName()}`;
          const infoList = await api.listPatientImage(patientId);
          infoList.forEach((i) => {
            const stamp = extractPatientImageDate(i.name);
            if (stamp == undefined) {
              console.log(i.name);
            }
          });
          sortPatientImages(infoList);
          images = infoList.map((i) => i.name);
        },
      },
    });
  }

  function doShowImage(img: string): void {
    const url = api.patientImageUrl(patientId, img);
    if (img.endsWith(".pdf")) {
      if( window ){
        window.open(url, "_blank");
      }
    } else {
      const d: ImageDialog = new ImageDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          title: "患者保存画像",
          url,
        },
      });
    }
  }

  function doClose(): void {
    remove();
  }
</script>

<div class="top">
  <div class="title main">保存画像</div>
  <div class="title">患者選択</div>
  <div class="work" data-cy="patient-workarea">
    <span data-cy="patient-text">{patientText}</span>
    <a href="javascript:void(0)" on:click={doSelectPatient}>選択</a>
  </div>
  <div class="title">画像リスト</div>
  <div class="work search-result" data-cy="search-result">
    {#each images as img}
      <a href="javascript:void(0)" on:click={() => doShowImage(img)}
        data-cy="search-result-item" data-img={img}>{img}</a>
    {/each}
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

  .search-result {
    max-height: 10rem;
    overflow-y: auto;
  }

  .search-result a {
    display: block;
  }

  .commands {
    margin: 10px 0;
  }
</style>
