import { GengouList } from "myclinic-util";
import DatePickerPopup from "./DatePickerPopup.svelte"

type PopupOpts = {
  gengouList?: string[],
  onCancel?: () => void,
}

function defaultGengouList(): string[] {
  return GengouList.map(g => g.name);
}

export function datePickerPopup(date: () => Date, onEnter: (d: Date) => void, opts: PopupOpts = {}): (e: MouseEvent) => void {
  return (e: MouseEvent) => {
    console.log("e", e);
    const d: DatePickerPopup = new DatePickerPopup({
      target: document.body,
      props: {
        date: date(),
        destroy: () => d.$destroy(),
        gengouList: opts.gengouList || defaultGengouList(),
        event: e,
        onEnter,
        onCancel: opts.onCancel || (() => { }),
      },
    });
  };
}