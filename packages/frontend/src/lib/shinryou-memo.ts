import type { Shinryou } from "myclinic-model";

export class ShinryouMemoWrapper {
    shinryou: Shinryou;

    constructor(shinryou: Shinryou) {
        this.shinryou = shinryou;
    }
}
