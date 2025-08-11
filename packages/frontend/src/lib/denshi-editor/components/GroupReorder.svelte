<script lang="ts">
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import Commands from "./workarea/Commands.svelte";
  import type { RP剤情報Edit } from "../denshi-edit";
  import { toZenkaku } from "@/lib/zenkaku";
  import { groupRep } from "./group-reorder/group-reorder-helper";
  import { onMount } from "svelte";

  export let groups: RP剤情報Edit[];
  export let onEnter: (value: RP剤情報Edit[]) => void;
  export let onCancel: () => void;
  let ordered: RP剤情報Edit[] = [...groups];
  let groupIdElementMap: Record<string, HTMLDivElement> = {};
  let groupListElement: HTMLElement;
  let draggedGroup: RP剤情報Edit | null = null;
  let draggedElement: HTMLElement | null = null;
  let ghostElement: HTMLElement | null = null;
  let placeholder: HTMLElement | null = null;

  onMount(() => {
    for(let g of ordered) {
      let e = groupListElement.querySelector(`[data-group-id="${g.id}"]`);
      if( e == null ){
        throw new Error(`cannot find element for ${g.id}`)
      }
      groupIdElementMap[g.id] = e as HTMLDivElement;
    }
  })

  function doEnter() {
    console.log("ordered", ordered);
    onEnter(ordered);
  }

  function doCancel() {
    onCancel();
  }

  function doMouseDown(g: RP剤情報Edit, ev: MouseEvent) {
    ev.preventDefault();
    draggedGroup = g;
    draggedElement = groupIdElementMap[g.id];
    
    const rect = draggedElement.getBoundingClientRect();
    const offsetX = ev.clientX - rect.left;
    const offsetY = ev.clientY - rect.top;

    ghostElement = document.createElement('div');
    ghostElement.className = 'group-item dragging';
    const currentIndex = ordered.findIndex(item => item.id === g.id);
    ghostElement.textContent = `${toZenkaku(`${currentIndex+1})`)} ${groupRep(g)}`;
    ghostElement.style.position = 'fixed';
    ghostElement.style.left = ev.clientX - offsetX + 'px';
    ghostElement.style.top = ev.clientY - offsetY + 'px';
    ghostElement.style.width = rect.width + 'px';
    ghostElement.style.zIndex = '1000';
    ghostElement.style.opacity = '0.8';
    ghostElement.style.pointerEvents = 'none';
    document.body.appendChild(ghostElement);

    placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    placeholder.textContent = `${toZenkaku(`${currentIndex+1})`)} ${groupRep(g)}`;
    placeholder.style.height = rect.height + 'px';
    placeholder.style.border = '2px dashed #ccc';
    placeholder.style.backgroundColor = '#f0f0f0';
    placeholder.style.padding = '8px';
    placeholder.style.color = '#999';
    draggedElement.parentNode?.insertBefore(placeholder, draggedElement);
    draggedElement.style.display = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (ghostElement) {
        ghostElement.style.left = moveEvent.clientX - offsetX + 'px';
        ghostElement.style.top = moveEvent.clientY - offsetY + 'px';
      }

      const elementUnder = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const closestGroupItem = elementUnder?.closest('.group-item') as HTMLElement;
      
      if (closestGroupItem && closestGroupItem !== draggedElement && placeholder) {
        const rect = closestGroupItem.getBoundingClientRect();
        const mouseY = moveEvent.clientY;
        const itemCenterY = rect.top + rect.height / 2;
        
        if (mouseY < itemCenterY) {
          closestGroupItem.parentNode?.insertBefore(placeholder, closestGroupItem);
        } else {
          closestGroupItem.parentNode?.insertBefore(placeholder, closestGroupItem.nextSibling);
        }
      }
    };

    const handleMouseUp = () => {
      if (ghostElement) {
        document.body.removeChild(ghostElement);
        ghostElement = null;
      }

      if (draggedElement && placeholder) {
        draggedElement.style.display = '';
        placeholder.parentNode?.insertBefore(draggedElement, placeholder);
        placeholder.parentNode?.removeChild(placeholder);
        placeholder = null;

        const newOrder: RP剤情報Edit[] = [];
        const groupElements = groupListElement.querySelectorAll('.group-item');
        groupElements.forEach((element) => {
          const groupId = parseInt(element.getAttribute('data-group-id')!);
          const group = ordered.find(g => g.id === groupId);
          if (group) {
            newOrder.push(group);
          }
        });
        ordered = newOrder;
      }

      draggedGroup = null;
      draggedElement = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

</script>

<Workarea>
  <Title>薬剤グループ順序編集</Title>
  <div bind:this={groupListElement}>
    {#each ordered as g, index (g.id)}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="group-item" data-group-id={g.id} on:mousedown={(ev) => doMouseDown(g, ev)}>
      {toZenkaku(`${index+1})`)}
      {groupRep(g)}
    </div>
    {/each}
  </div>
  <Commands>
    <button on:click={doEnter}>決定</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>

<style>
  .group-item {
    cursor: grab;
    user-select: none;
    padding: 8px;
    margin: 4px 0;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .group-item:hover {
    background-color: #f5f5f5;
  }

  .group-item:active {
    cursor: grabbing;
  }

  :global(.dragging) {
    background-color: #e3f2fd;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    transform: rotate(2deg);
  }

  :global(.placeholder) {
    margin: 4px 0;
    border-radius: 4px;
  }
</style>
