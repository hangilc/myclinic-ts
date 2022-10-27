<script lang="ts">
  import * as kanjidate from "kanjidate"

  export let date: Date | null;
  export let format: (date: Date | null) => string =
    (date: Date | null) => {
      if( date == null ){
        return "（未設定）";
      } else {
        return kanjidate.format(kanjidate.f2, date);
      }
    }
</script>

<span class="disp">{format(date)}</span>

<style>
  .disp {
    cursor: pointer;
  }
</style>