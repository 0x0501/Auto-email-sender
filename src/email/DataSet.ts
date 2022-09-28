import fs from "fs";
import CONFIG from "../config.js";
enum DATASET_ENUM {
    VALID_EMAIL_FORMAT = 1,
    INVALID_EMAIL_FORMAT = -1,

    EMAIL_SENDING_TEST_SUCCESS = 1,
    EMAIL_SENDING_TEST_FAILD = -1,

    RANDOM_EMAIL_TEST_VALID = 1,
    RANDOM_EMAIL_TEST_INVALID = -1,
    RANDOM_EMAIL_TEST_FAILD = 0,

    VERIFICATION_EXIST = 1,
    VERIFICATION_NOT_EXIST = -1,

    PORT_SCAN_SUCCESS = 1,
    PORT_SCAN_FAILD = -1,

    CONNECTION_TEST_SUCCESS = 1,
    CONNECTION_TEST_FAILD = -1,

    MX_RECORD_STATUS_EXIST = 1,
    MX_RECORD_STATUS_NOT_EXIST = -1,
}

class DataSet {
    public email: string;

    public email_format:
        | DATASET_ENUM.INVALID_EMAIL_FORMAT
        | DATASET_ENUM.VALID_EMAIL_FORMAT;

    public mx_record_status:
        | DATASET_ENUM.MX_RECORD_STATUS_EXIST
        | DATASET_ENUM.MX_RECORD_STATUS_NOT_EXIST;

    public port_scan:
        | DATASET_ENUM.PORT_SCAN_FAILD
        | DATASET_ENUM.PORT_SCAN_SUCCESS;

    public connection_test:
        | DATASET_ENUM.CONNECTION_TEST_FAILD
        | DATASET_ENUM.CONNECTION_TEST_SUCCESS;

    public random_email_test:
        | DATASET_ENUM.RANDOM_EMAIL_TEST_FAILD
        | DATASET_ENUM.RANDOM_EMAIL_TEST_INVALID
        | DATASET_ENUM.RANDOM_EMAIL_TEST_VALID;

    public email_sending_test:
        | DATASET_ENUM.EMAIL_SENDING_TEST_FAILD
        | DATASET_ENUM.EMAIL_SENDING_TEST_SUCCESS;

    public verification:
        | DATASET_ENUM.VERIFICATION_EXIST
        | DATASET_ENUM.VERIFICATION_NOT_EXIST;

    private _data: Array<Map<String, String | number>>;

    public constructor() {
        this._data = new Array();
    }

    public add(
        email: string,
        email_format:
            | DATASET_ENUM.INVALID_EMAIL_FORMAT
            | DATASET_ENUM.VALID_EMAIL_FORMAT,
        mx_record_status:
            | DATASET_ENUM.MX_RECORD_STATUS_EXIST
            | DATASET_ENUM.MX_RECORD_STATUS_NOT_EXIST,
        port_scan:
            | DATASET_ENUM.PORT_SCAN_FAILD
            | DATASET_ENUM.PORT_SCAN_SUCCESS,
        connection_test:
            | DATASET_ENUM.CONNECTION_TEST_FAILD
            | DATASET_ENUM.CONNECTION_TEST_SUCCESS,
        random_email_test:
            | DATASET_ENUM.RANDOM_EMAIL_TEST_FAILD
            | DATASET_ENUM.RANDOM_EMAIL_TEST_INVALID
            | DATASET_ENUM.RANDOM_EMAIL_TEST_VALID,
        email_sending_test:
            | DATASET_ENUM.EMAIL_SENDING_TEST_FAILD
            | DATASET_ENUM.EMAIL_SENDING_TEST_SUCCESS,
        verification?:
            | DATASET_ENUM.VERIFICATION_EXIST
            | DATASET_ENUM.VERIFICATION_NOT_EXIST
    ) {
        let dataSet = new Map<string, string | number>();
        dataSet.set("email", email);
        dataSet.set("format", email_format);
        dataSet.set("mx", mx_record_status);
        dataSet.set("port", port_scan);
        dataSet.set("c_email_test", connection_test);
        dataSet.set("r_email_test", random_email_test);
        dataSet.set("s_email_test", email_sending_test);

        if (verification != undefined) {
            dataSet.set("verification", verification);
        }

        this._data.push(dataSet);
    }

    public pop(): any {
        return this._data.slice().pop();
    }

    public export(modelArray: Array<any>) {
        this._data.forEach((item) => {
            modelArray.push(Object.fromEntries(item.entries()));
        });
    }

    public exportConsole() {
        let arr: Array<string> = [];

        this._data.forEach((item) => {
            arr.push(Object.fromEntries(item.entries()));
        });

        console.log(JSON.stringify(arr));
    }
}

export { DataSet, DATASET_ENUM };
