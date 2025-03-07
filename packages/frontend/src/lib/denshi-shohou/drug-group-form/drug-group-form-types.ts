import api from "@/lib/api";
import type { 薬品コード種別 } from "../denshi-shohou";
import type { IppanmeiState } from "../denshi-shohou-form/denshi-shohou-form-types";

export interface DrugKind {
    薬品コード種別: 薬品コード種別;
    薬品コード: string;
    薬品名称: string;
    単位名: string;
}

export async function resolveIppanmeiState(iyakuhincode: number, at: string): IppanmeiState {
    const m = await api.getIyakuhinMaster(iyakuhincode, at);
    if( m.ippanmei ){
        return { kind: "has-ippanmei", }
    }
} 
