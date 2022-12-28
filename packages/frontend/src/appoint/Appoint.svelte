<script lang="ts">
  import "/src/app.scss"
  import Header from "./Header.svelte"
  import TopRow from "./TopRow.svelte";
  import Column from "./Column.svelte";
  import { ColumnData } from "./column-data";
  import * as kanjidate from "kanjidate";
  import api from "@/lib/api";
  import type { ClinicOperation } from "myclinic-model";
  import { dateToSql } from "@/lib/util";
  import { AppointTimeData } from "./appoint-time-data";

  let startDate: Date = kanjidate.firstDayOfWeek(new Date());
  let cols: ColumnData[] = [];

  initColumns(startDate);

  async function initColumns(startDate: Date) {
    const dates = kanjidate.dateRange(startDate, 7);
    const map = await api.batchResolveClinicOperations(dates);
    const proms = dates.filter(d => {
      const op: ClinicOperation = map[dateToSql(d)];
      return !(op.code === "regular-holiday");
    }).map(async d => {
      const pairs = await api.listAppoints(d);
      const appoints = pairs.map(pair => new AppointTimeData(...pair));
      return new ColumnData(d, map[dateToSql(d)], appoints);
    });
    cols = await Promise.all(proms);
  }

  async function doCreateAppoints() {
    const upto = kanjidate.addDays(startDate, 6);
    await api.fillAppointTimes(startDate, upto);
  }

</script>

<div class="top">
  <div>
    <Header />
    <TopRow onCreateAppoints={doCreateAppoints}/>
    <div class="cols-wrapper">
      {#each cols as col}
        <Column data={col}/>
      {/each}
    </div>
  </div>
</div>

<style>
  .top {
    display: flex;
    justify-content: center;
    margin: 10px 0;
  }

  .cols-wrapper {
    display: flex;
    justify-content: center;
  }

  .cols-wrapper > :global(div) {
    margin-right: 16px;
  }

  .cols-wrapper > :global(div:last-of-type) {
    margin-right: 0;
  }
</style>