export class WorkareaService {
  clear: () => void;
  confirmForClear: () => Promise<boolean>;
  
  constructor() {
    this.clear = () => undefined;
    this.confirmForClear = () => Promise.resolve(true);
  }

  reset(): void {
    this.clear = () => undefined;
    this.confirmForClear = () => Promise.resolve(true);
  }

  setClear(clear: () => void): void {
    this.clear = clear;
  }

  setClearByDestroy(destroy: () => void): void {
    this.setClear(() => {
      destroy();
      this.reset();
    })
  }

  setConfirmForClear(confirmForClear: () => Promise<boolean>): void {
    this.confirmForClear = confirmForClear;
  }
}