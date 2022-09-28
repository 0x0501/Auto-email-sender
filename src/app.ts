/*
 * @Author: sumku404
 * @Date: 2022-08-17 09:39:42
 * @Description:
 */

import EmailClient from "./email/EmailClient.js";

const client = EmailClient.initialize();
client.sendEmails();
client.free();