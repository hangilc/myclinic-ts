export interface HoumonKangoDataArg {
  title?: string;
}

export class HoumonKangoData {
  title: string;

  constructor(arg: HoumonKangoDataArg = {}) {
    this.title = arg.title ?? "介護予防訪問看護・訪問看護指示書";
  }
}