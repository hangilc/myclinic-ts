<script lang="ts">
  export let fileName: string;
</script>

<div>
  <span>{fileName}</span>
  <a href="javascript:void(0)">表示</a> |
  <a href="javascript:void(0)">再スキャン</a> |
  <a href="javascript:void(0)">削除</a>
</div>

<style>
  a:first-of-type {
    margin-left: 10px;
  }
</style>