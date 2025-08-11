export class WorkareaService {
  clear: () => void;
  confirm: () => Promise<boolean>;
  
  constructor() {
    this.clear = () => {};
    this.confirm = async () => true;
  }

  async confirmAndClear(): Promise<boolean> {
    let ok = await this.confirm();
    if( ok ){
      this.clear();
      this.reset();
    }
    return ok;
  }

  reset(): void {
    this.clear = () => undefined;
    this.confirm = async() => true;
  }

  setClear(clear: () => void): void {
    this.clear = clear;
  }

  setClearByDestroy(destroy: () => void): void {
    this.setClear(() => {
      destroy();
    })
  }

  setConfirm(confirm: () => Promise<boolean>) {
    this.confirm = confirm;
  }
}