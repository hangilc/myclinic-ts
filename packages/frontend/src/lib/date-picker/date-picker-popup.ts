import DatePickerPopup from "./DatePickerPopup.svelte"
import * as kanjidate from "kanjidate";

type PopupOpts = {
  gengouList?: string[],
  onCancel?: () => void,
}

function defaultGengouList(): string[] {
  return kanjidate.GengouList.map(g => g.kanji);
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
        onCancel: opts.onCancel || (() => {}),
      },
    });
  };
}