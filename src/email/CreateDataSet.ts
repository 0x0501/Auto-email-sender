import fs, { rmSync } from "fs";
import CONFIG from "../config.js";
import { backSpaceFilter, getRandomSection, consoleColored } from "../helper.js";
import dns from "dns";
import net from "net";
import { TelnetSocket } from "telnet-stream";
import { DataSet, DATASET_ENUM } from "./DataSet.js";
import DecisionTree from "./DecisionTree.js";

class CreateDataSet {
    private _emails: Array<string>;

    private __END__: string = "\r\n";

    private __MODEL__: any;

    private static _instance: CreateDataSet;

    private constructor() {
        this._emails = fs
            .readFileSync(CONFIG.mailDataFile, "utf-8")
            .split(",")
            .map(backSpaceFilter);
        this.__MODEL__ = JSON.parse(
            fs.readFileSync(CONFIG.dataModelPath, "utf-8")
        );
    }

    public static get() {
        if (!this._instance) {
            return new CreateDataSet();
        }
        return this._instance;
    }

    public rawData() {
        if (this._emails) {
            return this._emails;
        }
        return "";
    }

    public generateRandomEmail(suffix: string): string {
        let chars: string =
            "AaBbCcDdEeFfGgHhIjJkKlLMmNnOoPpQqRrSsTtUuVvWwXxYyzZ1234567890";
        let email: string = "";

        for (let i = 0; i < 15; i++) {
            email += chars[Math.floor(Math.random() * chars.length)];
        }
        return email + "@" + suffix;
    }

    private checkEmailFormat(email: string): boolean {
        return new RegExp(
            /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/g
        ).test(email);
    }

    public getDomain(email: string): any {
        let result = email.split("@")[1];
        return result?.toString();
    }

    public async connectionTest(smtpHost: string, email: string) {
        let client = net.createConnection(25, smtpHost);
        let tSocket = new TelnetSocket(client);
        tSocket.setEncoding("ascii");
        tSocket.setTimeout(30000, () => {
            tSocket.end();
        });

        return new Promise<any>((resolve, reject) => {
            let status = {
                connection: -1,
                random_test: -1,
                send_test: -1,

                //weight
                verification: 0,
            };

            let step = 0;

            tSocket.on("connect", () => {
                consoleColored("notice", "start to connection test.");
                tSocket.write("EHLO mail.baidu.com" + "\r\n", "ascii");
            });

            tSocket.on("error", (err) => {
                status.connection = DATASET_ENUM.CONNECTION_TEST_FAILD;
                tSocket.destroy();
                resolve(status);
            });

            tSocket.on("end", () => {
                tSocket.destroy();
                resolve(status);
            });

            tSocket.on("timeout", () => {
                status.verification = DATASET_ENUM.VERIFICATION_NOT_EXIST;
                consoleColored(
                    "error",
                    `Waiting response timeout. (${CONFIG.timing / 10}s.)`
                );
                tSocket.destroy();
                resolve(status);
            });

            tSocket.on("data", (buffer) => {
                consoleColored("warning", "step=" + step);
                consoleColored("warning", buffer.toString());
                if (
                    (buffer.toString().includes("250") ||
                        buffer.toString().includes("220")) &&
                    step == 0
                ) {
                    step++;
                    status.connection = DATASET_ENUM.CONNECTION_TEST_SUCCESS;
                    tSocket.write("EHLO mail.baidu.com" + "\r\n", "ascii");
                    tSocket.write(
                        "MAIL FROM: <198546431@qq.com>" + "\r\n",
                        "ascii"
                    );
                    consoleColored(
                        "notice",
                        `Email: <${email}> connection test success.`
                    );
                } else if (
                    (buffer.toString().includes("503") ||
                        buffer.toString().includes("500")) &&
                    step == 1
                ) {
                    step++;
                    tSocket.write("EHLO mail.baidu.com" + "\r\n", "ascii");
                } else if (
                    (buffer.toString().includes("200") ||
                        buffer.toString().includes("250")) &&
                    step == 1
                ) {
                    step++;
                    consoleColored("warning", "Send Random Email test.");
                    tSocket.write(
                        "RCPT TO: <" +
                            this.generateRandomEmail(email.split("@")[1]) +
                            ">" +
                            "\r\n",
                        "ascii"
                    );
                } else if (buffer.toString().includes("250") && step == 2) {
                    //random email test
                    step++;
                    consoleColored("warning", "Send Random Email test.");
                    tSocket.write(
                        "RCPT TO: <" +
                            this.generateRandomEmail(email.split("@")[1]) +
                            ">" +
                            "\r\n",
                        "ascii"
                    );
                } else if (
                    (buffer.toString().includes("550") ||
                        buffer.toString().includes("500") ||
                        buffer.toString().includes("502") ||
                        buffer.toString().includes("450")) &&
                    step == 2
                ) {
                    step++;
                    status.random_test = DATASET_ENUM.RANDOM_EMAIL_TEST_INVALID;
                    consoleColored(
                        "notice",
                        "Random Email test Success, Next: target email test."
                    );
                    tSocket.write("RCPT TO: <" + email + ">" + "\r\n", "ascii");
                    // tSocket.destroy();
                    // resolve(status);
                } else if (
                    (buffer.toString().includes("250") ||
                        buffer.toString().includes("200") ||
                        buffer.toString().includes("450")) &&
                    step == 3
                ) {
                    step++;
                    status.random_test = DATASET_ENUM.RANDOM_EMAIL_TEST_FAILD;
                    consoleColored(
                        "notice",
                        `Random email test result: Faild. Can't use random testing. Now target test.`
                    );
                    tSocket.write("RCPT TO: <" + email + ">" + "\r\n", "ascii");
                } else if (
                    (buffer.toString().includes("550") ||
                        buffer.toString().includes("500") ||
                        buffer.toString().includes("502")) &&
                    step == 3
                ) {
                    //traget email test
                    step++;
                    status.random_test = DATASET_ENUM.RANDOM_EMAIL_TEST_INVALID;
                    status.send_test = DATASET_ENUM.EMAIL_SENDING_TEST_FAILD;
                    // status.verification = DATASET_ENUM.VERIFICATION_NOT_EXIST;
                    consoleColored(
                        "error",
                        `Target email test result: Email <${email}> does not exist.`
                    );
                    tSocket.destroy();
                    resolve(status);
                } else if (
                    (buffer.toString().includes("550") ||
                        buffer.toString().includes("500") ||
                        buffer.toString().includes("502") ||
                        buffer.toString().includes("450")) &&
                    step == 4
                ) {
                    step++;
                    consoleColored(
                        "warning",
                        "The target email may not exist."
                    );
                    status.verification = DATASET_ENUM.VERIFICATION_NOT_EXIST;
                    tSocket.destroy();
                    resolve(status);
                } else if (
                    (buffer.toString().includes("250") ||
                        buffer.toString().includes("200")) &&
                    step == 4
                ) {
                    //Email may exist
                    step++;
                    consoleColored(
                        "warning",
                        "The target email may exist. Now continue to send test."
                    );
                    status.random_test = DATASET_ENUM.RANDOM_EMAIL_TEST_VALID;
                    status.verification = DATASET_ENUM.VERIFICATION_EXIST;
                    tSocket.write("DATA" + "\r\n", "ascii");
                } else if (
                    (buffer.toString().includes("250") ||
                        buffer.toString().includes("200") ||
                        buffer.toString().includes("354")) &&
                    step == 5
                ) {
                    step++;
                    //send test
                    tSocket.write(
                        "From: <198546431@gmail.com>" + "\r\n",
                        "ascii"
                    );
                    tSocket.write("To: <" + email + ">" + "\r\n", "ascii");
                    tSocket.write(
                        "Subject: <" +
                            "this is helen from CoCo Coffee" +
                            ">" +
                            "\r\n",
                        "ascii"
                    );
                    tSocket.write("\r\n", "ascii");
                    tSocket.write("\r\n", "ascii");
                    tSocket.write(".", "ascii");
                    tSocket.write("\r\n", "ascii");
                    tSocket.write("\r\n", "ascii");
                } else if (buffer.toString().includes("250") && step == 6) {
                    status.send_test = DATASET_ENUM.EMAIL_SENDING_TEST_SUCCESS;
                    consoleColored("notice", "Sending test success.");
                    tSocket.destroy();
                    resolve(status);
                } else if (buffer.toString().includes("550") && step == 6) {
                    consoleColored("error", "Sending test faild.");
                    status.send_test = DATASET_ENUM.EMAIL_SENDING_TEST_FAILD;
                    tSocket.destroy();
                    resolve(status);
                }
                // console.log(buffer.toString())
            });
        });
    }

    public async lookUpMXRecord(hostname: string) {
        return new Promise<any>((resolve) => {
            dns.resolveMx(hostname, (err, address) => {
                consoleColored("notice", "hostname: " + hostname);
                consoleColored("notice", "start to resolve MX record.");
                let status = true;

                if (
                    err != null || address == undefined || null
                        ? true
                        : address[address.length - 1].exchange == "" ||
                          address.length <= 0
                ) {
                    status = false;
                }

                resolve({
                    status: status,
                    domain:
                        address == undefined
                            ? ""
                            : address[getRandomSection(0, address.length - 1)]
                                  .exchange,
                });
            });
        });
    }

    /**
     *
     * @param data
     * @param decisionTree
     * @returns
     */
    public judge(data: any, decisionTree: DecisionTree) {
        let status = false;
        let frag = 20.5;
        let percent = 0;

        if (data.verification == 0) {
            consoleColored("notice", "start to predict.");
            data.verification = Number.parseInt(decisionTree.predict(data));
        }

        if (data.format == 1) {
            percent += frag;
        } else {
            percent -= frag;
        }
        if (data.mx == 1) {
            percent += frag;
        } else {
            percent -= frag;
        }

        if (data.c_email_test == 1) {
            percent += frag;
        }

        if (data.r_email_test == 1) {
            percent += frag;
        }

        if (data.s_email_test == 1) {
            percent += frag;
        }

        if (data.verification == -1) {
            percent -= (100 / 5) * (0.5 * 6);
        }
        // this.update(data);
        // this.save();

        consoleColored("notice", `RESULT: ${percent + 0.0}%.`);
    }

    public getModel() {
        return this.__MODEL__;
    }

    public async lookUpSingleEmail(email: string) {
        let dataSet = new DataSet();

        let emailFormatTest = this.checkEmailFormat(email)
            ? DATASET_ENUM.VALID_EMAIL_FORMAT
            : DATASET_ENUM.INVALID_EMAIL_FORMAT;

        let portScan = DATASET_ENUM.PORT_SCAN_SUCCESS;

        let otherConnectionTest: any = null;

        //If the lookUpMXRecord function return false, then drop into not exist
        let mxLookUpStatus = await this.lookUpMXRecord(this.getDomain(email));

        otherConnectionTest = await this.connectionTest(
            mxLookUpStatus.domain,
            email
        );

        dataSet.add(
            email,
            emailFormatTest,
            mxLookUpStatus.status
                ? DATASET_ENUM.MX_RECORD_STATUS_EXIST
                : DATASET_ENUM.MX_RECORD_STATUS_NOT_EXIST,
            portScan,
            otherConnectionTest.connection == null || undefined
                ? -1
                : otherConnectionTest.connection,
            otherConnectionTest.random_test == null || undefined
                ? -1
                : otherConnectionTest.random_test,
            otherConnectionTest.send_test == null || undefined
                ? -1
                : otherConnectionTest.send_test,
            otherConnectionTest.verification == 0
                ? mxLookUpStatus.status
                    ? otherConnectionTest.verification
                    : DATASET_ENUM.VERIFICATION_NOT_EXIST
                : otherConnectionTest.verification
        );
        consoleColored(
            "notice",
            `lookUp: ${email} success, you'd start to predict.`
        );

        return new Promise<any>((resolve) => {
            resolve(Object.fromEntries(dataSet.pop().entries()));
        });
    }

    public async build() {
        let dataSet = new DataSet();

        // get emails from list
        for (let x of this._emails) {
            let emailFormatTest = this.checkEmailFormat(x)
                ? DATASET_ENUM.VALID_EMAIL_FORMAT
                : DATASET_ENUM.INVALID_EMAIL_FORMAT;

            let portScan = DATASET_ENUM.PORT_SCAN_SUCCESS;

            let otherConnectionTest: any = null;

            //If the lookUpMXRecord function return false, then drop into not exist
            let mxLookUpStatus = await this.lookUpMXRecord(this.getDomain(x));

            otherConnectionTest = await this.connectionTest(
                mxLookUpStatus.domain,
                x
            );

            dataSet.add(
                x,
                emailFormatTest,
                mxLookUpStatus.status
                    ? DATASET_ENUM.MX_RECORD_STATUS_EXIST
                    : DATASET_ENUM.MX_RECORD_STATUS_NOT_EXIST,
                portScan,
                otherConnectionTest.connection == null || undefined
                    ? -1
                    : otherConnectionTest.connection,
                otherConnectionTest.random_test == null || undefined
                    ? -1
                    : otherConnectionTest.random_test,
                otherConnectionTest.send_test == null || undefined
                    ? -1
                    : otherConnectionTest.send_test,
                DATASET_ENUM.VERIFICATION_EXIST
            );

            // dataSet.add(
            //     x,
            //     DATASET_ENUM.VALID_EMAIL_FORMAT,
            //     DATASET_ENUM.MX_RECORD_STATUS_EXIST,
            //     DATASET_ENUM.PORT_SCAN_SUCCESS,
            //     DATASET_ENUM.CONNECTION_TEST_SUCCESS,
            //     DATASET_ENUM.RANDOM_EMAIL_TEST_VALID,
            //     DATASET_ENUM.EMAIL_SENDING_TEST_FAILD,
            //     DATASET_ENUM.VERIFICATION_NOT_EXIST
            // );

            consoleColored("notice", `====train: ${x} succsss===========`);
            // dataSet.exportConsole()
        }
        consoleColored("warning", "saving datas...");
        dataSet.export(this.__MODEL__);
        consoleColored("notice", `data Length: ${this.__MODEL__.length}`);
        this.save();
    }

    public update(data: object) {
        consoleColored(
            "warning",
            `updating datas... [len=${this.__MODEL__.length}]`
        );
        this.__MODEL__.push(data);
        consoleColored(
            "notice",
            `updated success [len=${this.__MODEL__.length}]`
        );
    }

    public save() {
        consoleColored("warning", "saving datas...");
        fs.writeFileSync(
            CONFIG.dataModelPath,
            JSON.stringify(this.__MODEL__),
            "utf-8"
        );
        consoleColored("notice", `data Length: ${this.__MODEL__.length}`);
    }
}

export default CreateDataSet;
