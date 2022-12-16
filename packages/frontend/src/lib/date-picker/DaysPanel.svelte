<script lang="ts">
  import * as kanjidate from "kanjidate";
  import { DateItem } from "./date-item";

  export let gengou: string;
  export let nen: number;
  export let month: number;
  export let day: number;

  let dateItems: DateItem[];
  $: dateItems = init(gengou, nen, month, day);

  function init(
    gengou: string,
    nen: number,
    month: number,
    day: number
  ): DateItem[] {
    let year = kanjidate.fromGengou(gengou, nen);
    let firstDate = new Date(year, month - 1, 1);
    let pres: DateItem[] = preDateItems(firstDate);
    let curs: DateItem[] = curDateItems(
      firstDate,
      kanjidate.lastDayOfMonth(year, month),
      day
    );
    let posts: DateItem[] = postDateItems(
      new Date(year, month - 1, kanjidate.lastDayOfMonth(year, month))
    );
    return [...pres, ...curs, ...posts];
  }

  function preDateItems(firstDate: Date): DateItem[] {
    let dow = firstDate.getDay();
    let npre: number = dow === 0 ? 7 : dow;
    let preItems: DateItem[] = [];
    for (let i = 1; i <= npre; i++) {
      let d: Date = kanjidate.addDays(firstDate, -i);
      preItems.push(new DateItem(d, "pre", false));
    }
    return preItems.reverse();
  }

  function curDateItems(
    firstDate: Date,
    n: number,
    curDay: number
  ): DateItem[] {
    let items: DateItem[] = [];
    for (let i = 1; i <= n; i++) {
      let d = kanjidate.addDays(firstDate, i - 1);
      items.push(new DateItem(d, "cur", i === curDay));
    }
    return items;
  }

  function postDateItems(lastDate: Date): DateItem[] {
    let dow = lastDate.getDay();
    let n = dow === 6 ? 7 : 6 - dow;
    let items: DateItem[] = [];
    for (let i = 1; i <= n; i++) {
      let d = kanjidate.addDays(lastDate, i);
      items.push(new DateItem(d, "post", false));
    }
    return items;
  }
</script>

<div class="days-panel">
  <span class="sunday">日</span>
  <span>月</span>
  <span>火</span>
  <span>水</span>
  <span>木</span>
  <span>金</span>
  <span>土</span>
  {#each dateItems as di (di.date)}
    <span class={di.kind} class:selected={di.isCurrent}>
      {di.date.getDate()}
    </span>
  {/each}
</div>

<style>
  .days-panel {
    display: grid;
    grid-template-columns: repeat(7, 1.5em);
    margin-top: 4px;
  }

  .days-panel span {
    text-align: right;
    cursor: default;
  }

  .days-panel span.selected {
    background-color: #ccc;
  }

  .days-panel span.pre,
  .days-panel span.post {
    color: #999;
  }

  .sunday {
    color: red;
  }
</style>
