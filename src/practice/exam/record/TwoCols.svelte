<div class="top">
  <div class="left"><slot name="left"></slot></div>
  <div class="right"><slot name="right"></slot></div>
</div>

<style>
  .top {
    display: flex;
    align-items: flex-start;
  }

  .left {
    flex: 0 0 50%;
    padding-right: 4px;
  }

  .right {
    flex: 0 0 50%;
    padding-left: 4px;
  }
</style>