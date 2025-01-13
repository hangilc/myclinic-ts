import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
import type { UsageMaster } from "myclinic-model";

export type Source = ({
  kind: "parsed";
  name: string;
  amount: string;
  usage: string;
  times: string | undefined;
} | 
{
  kind: "denshi";
  data: RP剤情報;
}) & { id: number };

export type TargetUsage = {
  kind: "master";
  master: UsageMaster;
} | {
  kind: "free-style";
  text: string;
}