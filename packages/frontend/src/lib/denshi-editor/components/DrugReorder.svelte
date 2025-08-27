<script lang="ts">
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import Commands from "./workarea/Commands.svelte";
  import type { 薬品情報Edit } from "../denshi-edit";
  import { onMount } from "svelte";

  export let drugs: 薬品情報Edit[];
  export let onCancel: () => void;
  export let onEnter: (ordered: 薬品情報Edit[]) => void;

  let ordered: 薬品情報Edit[] = [...drugs];
  let drugListElement: HTMLElement;
  let drugIdEleMap: Record<string, HTMLElement> = {};
  let dragged: { offsetX: number, offsetY: number, placeholder: HTMLElement } | undefined = undefined;

  onMount(() => {
    let eles = drugListElement.querySelectorAll("[data-drug-id]");
    eles.forEach(e => {
      let drugId = e.getAttribute("data-drug-id")!;
      drugIdEleMap[drugId] = e as HTMLElement;
    })
  });

  function doMouseDown(drug: 薬品情報Edit, event: MouseEvent) {
    let e = drugIdEleMap[drug.id];
    if( !e ){
      return;
    }
    let r = e.getBoundingClientRect();
    let offsetX = event.clientX - r.left;
    let offsetY = event.clientY - r.top;
    let placeholder = document.createElement("div");
    placeholder.classList.add("placeholder");
    dragged = { offsetX, offsetY, placeholder };
    drugListElement.insertBefore(placeholder, e);
    e.classList.add("dragged");
    e.style.position = "fixed";
    e.style.left = r.left + "px";
    e.style.top = r.top + "px";
    e.style.zIndex = "1000";
    e.setPointerCapture(1);
    e.addEventListener("mouseup", doMouseUp);
    e.addEventListener("mousemove", doMouseMove);
  }

  function doMouseUp(this: HTMLElement, _event: MouseEvent) {
    this.classList.remove("dragged");
    this.style.position = "";
    this.style.top = "";
    if( dragged ){
      this.style.position = "";
      this.style.left = "";
      this.style.top = "";
      this.style.zIndex = "";
      drugListElement.insertBefore(this, dragged.placeholder);
      dragged.placeholder.remove();
      
      let drugElements = drugListElement.querySelectorAll('[data-drug-id]');
      let newOrdered: 薬品情報Edit[] = [];
      drugElements.forEach(element => {
        let drugId = parseInt(element.getAttribute('data-drug-id')!);
        let drug = ordered.find(d => d.id === drugId);
        if (drug) {
          newOrdered.push(drug);
        }
      });
      ordered = newOrdered;
      console.log("ordered", ordered);
    }
    dragged = undefined;
    this.removeEventListener("mouseup", doMouseUp);
    this.removeEventListener("mousemove", doMouseMove);
  }

  function doMouseMove(this: HTMLElement, event: MouseEvent) {
    if( !dragged ){
      return;
    }
    this.style.left = (event.clientX - dragged.offsetX) + "px"
    this.style.top = (event.clientY - dragged.offsetY) + "px";
    
    this.style.pointerEvents = 'none';
    let elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY);
    this.style.pointerEvents = '';
    
    let drugItem = elementUnderMouse?.closest('[data-drug-id]');
    
    if (drugItem && drugItem !== this && drugListElement.contains(drugItem)) {
      let rect = drugItem.getBoundingClientRect();
      let midpoint = rect.top + rect.height / 2;
      
      if (event.clientY < midpoint) {
        drugListElement.insertBefore(dragged.placeholder, drugItem);
      } else {
        drugListElement.insertBefore(dragged.placeholder, drugItem.nextSibling);
      }
    }
  }

  function drugRep(drug: 薬品情報Edit): string {
    return drug.薬品レコード.薬品名称;
  }

  function doEnter() {
    onEnter(ordered);
  }
  
  function doCancel() {
    onCancel();
  }

</script>

<Workarea>
  <Title>薬剤順序編集</Title>
  <div bind:this={drugListElement} class="drug-list">
    {#each ordered as drug (drug.id)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="drug-item"
        data-drug-id={drug.id}
        on:mousedown={(ev) => doMouseDown(drug, ev)}
      >
        {drugRep(drug)}
      </div>
    {/each}
  </div>
  <Commands>
    <button on:click={doEnter}>決定</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>

<style>
  .drug-list, .drug-list * {
    user-select: none;
  }

  .drug-list :global(.placeholder) {
    width: auto;
    border: 2px solid black;
  }

  .drug-item {
    cursor: grab;
  }

  .drug-item:global(.dragged) {
    border: 1px solid gray;
    cursor: grabbing;
    opacity: 0.8;
    background-color: rgba(255, 255, 255, 0.9);
  }

</style>
