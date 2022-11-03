export class AppError {
  private isAppError: boolean = true;
  public message: string;

  constructor(msg: string) {
    this.message = msg;
  }
}
