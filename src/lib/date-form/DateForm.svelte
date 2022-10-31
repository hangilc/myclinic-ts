<script lang="ts">
  import * as kanjidate from "kanjidate"

  export let date: Date | null;
  let gengouValue: string;
  let nenValue: string;
  let monthValue: string;
  let dayValue: string;

  function updateValues(): void {
    
  }

</script>

<div class="top">
  <select>
    <option>昭和</option>
    <option>平成</option>
    <option>令和</option>
  </select>
  <input type="text" class="nen" />
  <span>年</span>
  <input type="text" class="month" />
  <span>月</span>
  <input type="text" class="day" />
  <span>日</span>
</div>

<style>
  .top {
    display: flex;
    align-items: center;
  }

  .nen {
    margin-left: 1px;
  }

  .month, .day {
    margin-left: 2px;
  }

  .nen, .month, .day {
    width: 2em;
  }
</style>