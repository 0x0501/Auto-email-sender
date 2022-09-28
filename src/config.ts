/*
 * @Author: sumku404
 * @Date: 2022-08-19 19:59:21
 * @Description:
 */

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
