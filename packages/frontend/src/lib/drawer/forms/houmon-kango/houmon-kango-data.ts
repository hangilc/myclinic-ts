export interface HoumonKangoDataArg {
  title?: string;
  subtitle?: string;
}

export class HoumonKangoData {
  title: string;
  subtitle: string;

  constructor(arg: HoumonKangoDataArg = {}) {
    this.title = arg.title ?? "介護予防訪問看護・訪問看護指示書";
    this.subtitle = arg.subtitle ?? "訪問看護指示期間";
  }
}