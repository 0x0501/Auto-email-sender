/*
 * @Author: sumku404
 * @Date: 2022-08-19 19:59:21
 * @Description:
 */

import { NAME_LIST } from "./defines.js";
import { getRandomSection } from "./helper.js";

//===========================CONFIG=============================

const CONFIG = {
    /** @type {string} email username */
    username : '',

    /** @type {string} email password */
    password : '',

    /** @type {string} email server */
    mailHost: "mail.wirenetting-china.com",

    /** @type {string} emails queue waiting for sending */
    mailDataFile: "static/customerEmails.csv",

    /** @type {string[]} Subjects, a string array.*/
    /**
        Every time the program running, it'll select randomly one item from this list.
        Caution! There has A COMMA between each row, and must quote the string with Double
        quotation marks(""), DO NOT FORGET IT!!!    -Elias. (Aluminium)
    */
    subjects: [
        "Hello, We've some iron fence news sharing with u:)",
        "This is YingKang Wire Mesh Product, Co, LTD",
    ],

    /** @type {string} Email content which could be raw string or given a path */
    /**
        As yet, I recommend you use A file but plain text instead, which had so many
        disadvantages and was inefficient.
    
    */
    content: [
        "static/templates/Email-lite.html",
        "static/templates/Email-normal.html",
    ],

    /** @type {object} A pair of key-value objects applying to template variables */
    magicVariables : {

        /**
            It'll replace the placeholder called `{{name}}` with random nickname.
        */
        name: NAME_LIST[getRandomSection(0, NAME_LIST.length - 1)],


        /**
            It'll replace the {{company}} variable with `Auto Email Sender`. You should change it if you wanna use it.
            For example, if your company name is `Alibaba Group Ltd.`, what you should do is fill in your company name
            in the corresponding variable value:

            ```
                company : 'Alibaba Group Ltd.'
            ```

            In your email, choose a drop zone for your company name:

            ```
            Hi, {{name}}
                I'm Elias from {{company}} ...

            ```

            the final email will be:

            ```
            Hi, James
                I'm Elias from Alibaba Group Ltd.
            ```
        */
        company : 'Auto Email Sender'
    },

    dataModelPath: "static/dataModel/model.json",

    /** @type {boolean} Whether the signature turn on or off */
    signature: false,

    /** @type {string} A path which indicated to the optmized signature HTML file. */
    signatureFile: "static/signatures/signature.html",

    /** @type {boolean} Whether debug mode is on or off */
    debug: true,

    /** @type {boolean} Whether record program execuating log as a file, which is stored in log directory */
    log: true,

    /** @type {number} sending interval time (millisecond)*/
    timing: 10000,
};
//===========================CONFIG=============================

export default CONFIG;
