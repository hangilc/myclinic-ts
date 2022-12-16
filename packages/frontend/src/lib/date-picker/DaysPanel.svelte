<script lang="ts">
</script>

<div class="days-panel">
  <span class="sunday">日</span>
  <span>月</span>
  <span>火</span>
  <span>水</span>
  <span>木</span>
  <span>金</span>
  <span>土</span>
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

  .sunday {
    color: red;
  }
</style>
