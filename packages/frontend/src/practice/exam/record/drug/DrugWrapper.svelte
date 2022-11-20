<script lang="ts">
  import { toZenkaku } from "@/lib/zenkaku";
  import { DrugCategory, type DrugEx, type VisitEx } from "myclinic-model";

  export let visit: VisitEx;

  function format(index: number, drug: DrugEx){
    let s: string = `${index})`;
    switch(drug.category){
      case DrugCategory.Naifuku: {
        s += `${drug.master.name} ${drug.amount}${drug.master.unit} ${drug.usage} ${drug.days}日分`;
        break;
      }
      case DrugCategory.Tonpuku: {
        s += `${drug.master.name} ${drug.amount}${drug.master.unit} ${drug.usage} ${drug.days}回分`;
        break;
      }
      case DrugCategory.Gaiyou: {
        s += `${drug.master.name} ${drug.amount}${drug.master.unit} ${drug.usage}`;
        break;
      }
    }
    return toZenkaku(s);
  }
</script>

<div>
  {#each visit.drugs as drug, i (drug.drugId)}
    <div>
      {format(i+1, drug)}
    </div>
  {/each}
</div>