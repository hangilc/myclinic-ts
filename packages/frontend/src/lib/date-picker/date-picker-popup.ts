import DatePickerPopup from "./DatePickerPopup.svelte"
import * as kanjidate from "kanjidate";

type PopupOpts = {
  gengouList?: string[],
  onCancel?: () => void,
}

function defaultGengouList(): string[] {
  return kanjidate.GengouList.map(g => g.kanji);
}

export function datePickerPopup(e: MouseEvent, date: Date, onEnter: (d: Date) => void, opts: PopupOpts = {}) {
  const d: DatePickerPopup = new DatePickerPopup({
    target: document.body,
    props: {
      date,
      destroy: () => d.$destroy(),
      gengouList: opts.gengouList || defaultGengouList(),
      event: e,
      onEnter,
      onCancel: opts.onCancel || (() => { }),
    },
  });
}