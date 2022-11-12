export class AppError {
  isAppError: boolean = true;
  public message: string;

  constructor(msg: string) {
    this.message = msg;
  }
}
