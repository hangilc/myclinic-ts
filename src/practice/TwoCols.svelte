<script type="ts">
  import SideMenu from "./SideMenu.svelte";
  import Main from "./Main.svelte";
  import { writable } from "svelte/store";

  const service = writable("exam");

  // test
  // import EditableDate from "@/lib/editable-date/EditableDate.svelte";
  // import DatePicker from "@/lib/date-picker/DatePicker.svelte";
  // import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import DateForm from "@/lib/date-form/DateForm.svelte";
  let obj = {
    a: new Date()
  }
  let date = new Date();
  let dateErrs = [];
  function click() {
    date = new Date("2022-12-31")
  }
  function doGet() {
    console.log(obj.a);
  }
</script>

<div class="two-cols">
  <div class="left">
    <SideMenu serviceStore={service}/>

    <!-- <EditableDate date={new Date()} /> -->
    <!-- <DatePicker date={new Date()}/> -->
    <!-- <DateFormWithCalendar date={new Date()}/> -->
    <DateForm bind:date={obj.a} errors={dateErrs}/>
    <button on:click={click}>click</button>
    <button on:click={doGet}>get</button>
  </div>
  <div class="right"><Main serviceStore={service}/></div>
</div>

<style>
  .two-cols {
    display: flex;
    align-items: flex-start;
    margin-top: 6px;
  }

  .left {
    flex: 0 0 200px;
    margin: 0 6px 10px 0;
  }

  .right {
    flex: 1 1 auto;
    margin: 0 0 10px 6px;
  }  
</style>