<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Shahokokuho } from "myclinic-model";
  import type { Hoken } from "../hoken";
  import type { PatientData } from "../patient-data";
  import fold = "./fold";

  export let data: PatientData;
  export let hoken: Hoken | undefined;
  export let destroy: () => void;
  let shahokokuho: Shahokokuho | undefined = hoken?.asShahokokuho;

  function foldS<T>(someF: (some: Shahokokuho) => T, noneF: T): T {
    return fold(shahokokuho, someF, noneF);
  }
  let errors: string[] = [];
  let hokenshaBangou: string = foldS(h => h.hokenshaBangou.toString(), "");
  let kigou: string = fold(shahokokuho, shahokokuho?.hihokenshaKigou ?? "";
  let bangou: string = shahokokuho?.hihokenshaBangou ?? "";
  let edaban: string = shahokokuho?.edaban ?? "";
  let honninKazoku: number = shahokokuho?.honninStore ?? 0;
  let validFrom: Date | null =
    shahokokuho != undefined ? parseSqlDate(shahokokuho.validFrom) : null;
  let validFromErrors: Invalid[] = [];
  let validUpto: Date | null =
    shahokokuho != undefined
      ? parseOptionalSqlDate(shahokokuho.validUpto)
      : null;
  let validUptoErrors: Invalid[] = [];
  let kourei: number = shahokokuho?.koureiStore ?? 0;
  
  function close(): void {
    destroy();
    data.goback();
  }
</script>

<SurfaceModal destroy={close} title="社保国保編集" />
