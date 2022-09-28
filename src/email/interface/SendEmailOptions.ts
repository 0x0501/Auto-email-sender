/*
 * @Author: sumku404
 * @Date: 2022-08-19 22:26:33
 * @Description:
 */

import Mail from "nodemailer/lib/mailer";
import SendEmailPackageDSN from "./SendEmailOptionDSN.js";

export default interface SendEmailOptions extends Mail.Options {
    dsn: SendEmailPackageDSN;
}
