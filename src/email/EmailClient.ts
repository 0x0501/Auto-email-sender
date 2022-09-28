/*
 * @Author: sumku404
 * @Date: 2022-08-17 18:57:48
 * @Description:
 */
import fs from "fs";
import nodemailer, { Transporter } from "nodemailer";
import path from "path";
import CONFIG from "../config.js";
import { NAME_LIST } from "../defines.js";
import { backSpaceFilter, consoleColored, getRandomSection } from "../helper.js";
import Logger from "../Logger.js";
import SendEmailOptions from "./interface/SendEmailOptions.js";

/// <reference path="EmailClient.ts" />
NAME_LIST
class EmailClient {
    private _EmailAccount: string;

    private _EmailPassword: string;

    private _Transporter: Transporter;

    private static _Instance: EmailClient;

    public emails: string[];

    private constructor() {
        // Initialize the mail data
        this._EmailAccount = CONFIG.username;
        this._EmailPassword = CONFIG.password;

        //fetch all the customer's email
        this.emails = fs
            .readFileSync(CONFIG.mailDataFile, "utf-8")
            .split(",")
            .map(backSpaceFilter);

        /**
         * @description init nodemailer.Transporter
         */
        this._Transporter = nodemailer.createTransport({
            host: CONFIG.mailHost,
            port: 465,
            secure: true,
            auth: {
                user: this._EmailAccount,
                pass: this._EmailPassword,
            },
            tls: {
                rejectUnauthorized: false,
            },
            debug: CONFIG.debug,
        });

        if (CONFIG.debug) {
            this._verifyAccoutSettings(this._Transporter);
        }
    }

    /**
     *
     * @returns {EmailClient} get the instance of EmailClient
     */
    public static initialize(): EmailClient {
        if (!this._Instance) {
            return new EmailClient();
        }
        return this._Instance;
    }

    /**
     *
     * @returns
     */
    private _getEmailSignature(): string {
        let signatureContent = fs.readFileSync(CONFIG.signatureFile, "utf-8");
        return signatureContent;
    }

    /**
     *
     * @returns {string}
     */
    private _getEmailContent(): string {
        let emailContent = "";

        let content =
            CONFIG.content[getRandomSection(0, CONFIG.content.length - 1)];

        /** If filepath is given, get the stream of the file */
        if (fs.existsSync(content)) {
            let tmp = fs.readFileSync(path.normalize(content), "utf-8");
            emailContent = this.parserTemplateVariables(
                {
                    name: NAME_LIST[getRandomSection(0, NAME_LIST.length - 1)],
                },
                tmp
            );
        } else {
            throw new Error(`The file ${content} doesn't exist.`);
        }

        /** if signature is enable, then get it */
        if (CONFIG.signature) {
            emailContent = emailContent.concat(this._getEmailSignature());
            consoleColored("notice", "Appending signature success.");
        }

        return emailContent;
    }

    /**
     *
     * @param index {number}
     * @returns
     */
    private _prepareSendEmail(index: number): SendEmailOptions {
        let randomKey = getRandomSection(0, CONFIG.subjects.length - 1);

        /**
         * @description init message
         */
        let message: SendEmailOptions = {
            from: this._EmailAccount,
            to: this.emails[index],
            subject: CONFIG.subjects[randomKey],
            html: this._getEmailContent(),
            dsn: {
                id : this._EmailAccount,
                return: "headers",
                notify: ["success", "failure", "delay"],
                recipient: this._EmailAccount,
            },
        };

        return message;
    }

    /**
     *
     * @param transporter
     */
    private _verifyAccoutSettings(transporter: Transporter) {
        transporter.verify((err, success) => {
            if (err) {
                throw new Error("Account Setting Verified Faild: " + err);
            } else {
                consoleColored("notice", "Account setting verified success.");
            }
        });
    }

    /**
     *
     * @param transporter
     * @param message
     * @returns {Promise<any>}
     */
    private async _sendEmail(
        transporter: nodemailer.Transporter,
        message: SendEmailOptions
    ): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(async () => {
                consoleColored(
                    "warning",
                    "Started sending email: " + message.to + "."
                );

                //Sync request
                let info = await transporter.sendMail(message);
                resolve(info);
            }, CONFIG.timing);
        });
    }

    /**
     *
     * example:
     *
     * obj = {
     *   name       : NAME_LIST[getRandomSection(0, NAME_LIST.length-1)],
     *   greeting   : 'morning'
     * }
     *
     * @description parser the variables in the email templates
     * @param VMap {object} A key-value object the Key must UNIQUE
     * @returns normalized email template
     */
    public parserTemplateVariables(VMap: object, template: string): string {
        let tmp = template;

        for (let x of Reflect.ownKeys(VMap)) {
            tmp = tmp.replace(`{{${String(x)}}}`, Reflect.get(VMap, x));
        }
        return tmp;
    }

    /**
     * @description close the nodemailer.Transport stream
     * @returns void
     */
    public free(): void {
        if (this._Transporter !== null) {
            this._Transporter.close();
            return;
        }
        throw new Error("You haven't control nodemailer.Transporter instance.");
    }

    /**
     * @description
     */
    public async sendEmails(): Promise<any> {

        const logger = CONFIG.log ? Logger.initialize() : null;

        for (let i = 0; i < this.emails.length; i++) {
            let message = this._prepareSendEmail(i);

            // using nodemailer sendEmail methind
            let result = await this._sendEmail(this._Transporter, message);

            // record logger
            if (logger) {
                logger.write(`Sender: ${this._EmailAccount}, To: ${this.emails[i]}`);
            }
            console.log(result);
        }

        logger?.close();
    }

    /**
     * @description Test Email account connection
     */
    public testAccount() {
        consoleColored("warning", "Tesing account...stand By");
        this._verifyAccoutSettings(this._Transporter);
    }
}

export default EmailClient;
