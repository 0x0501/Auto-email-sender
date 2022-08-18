import nodemailer from "nodemailer";

class Email {
  private _EamilAccount: string = "";

  private _EmailPassword: string = "";

  private _EmailSender: any;

  public get EamilAccount(): string {
    return this._EamilAccount;
  }
  public set EamilAccount(value: string) {
    this._EamilAccount = value;
  }

  public set EmailPassword(value: string) {
    this._EmailPassword = value;
  }

  constructor() {}

  init() {
    const tranporter = nodemailer.createTransport({
      host: "smtp.wirenetting-china.com",
      port: 587,
      secure: false,
    });
  }
}

exports.Email = Email;
