/*
 * @Author: sumku404
 * @Date: 2022-08-17 09:39:42
 * @Description:
 */

import nodemailer from "nodemailer";
import fs from 'fs';
import crypto from 'crypto';
import path from "path";

//===================CONFIG=========================

const CONFIG = {

    /** @type {string} email username */
    username : '',

    /** @type {string} email password */
    password : '',

    /** @type {string} email server */
    mailHost : 'mail.wirenetting-china.com',

    /** @type {string} emails queue waiting for sending */
    mailDataFile : 'static/customerEmails.csv',

    /** @type {string[]} Subjects, a string array.*/
    /**
        Every time the program running, it'll select randomly one item from this list.
        Caution! There has A COMMA between each row, and must quote the string with Double
        quotation marks(""), DO NOT FORGET IT!!!    -Elias.
    */
    subjects : [
        "YingKang Wire Mesh Sales! | 2022",
        "Hello, We've some iron fence news sharing with u:)",
        "This is YingKang Wire Mesh Product, Co, LTD",
        "Test Email - This Email sent By node.js"
    ],

    /** @type {string} Email content which could be raw string or given a path */
    /**
        As yet, I recommend you use A file but plain text instead, which had so many
        disadvantages and was inefficient.
    
    */
    content : "static/templates/Email-lite.html",

    /** @type {boolean} Whether the signature turn on or off */
    signature : false,

    /** @type {string} A path which indicated to the optmized signature HTML file. */
    signatureFile : ''
};


//===================CONFIG=========================


const backSpaceFilter = (value : string) => {
    return value.replace(/\r\n|\r|\n|\\s/g, '');
};

const getRandomSection = (start : number, end : number) => {
    return Math.floor(Math.random() * (end - start + 1) + start)
}

const emailContentGenerator = () => {

    let emailContent = '';

    if (CONFIG.content == '') {
        throw new Error('You must fill the content before you send the email!');
    }

    /** If filepath is given, get the stream of the file */
    if (fs.existsSync(CONFIG.content)) {
        emailContent = fs.readFileSync(path.normalize(CONFIG.content), 'utf-8');
    }else {
        emailContent = CONFIG.content;
    }

    /** If Signature is given, concat the signature HTML and content */
    if (CONFIG.signature) {
        let signatureContent = fs.readFileSync(CONFIG.signatureFile, 'utf-8');
        emailContent = emailContent.concat(signatureContent);
        console.log('Appedning Signature')
    }

    return emailContent;
};



const showConsoleMessage = (title : string, content : any) => {
    console.log(`==================${title}=================`);

    console.log(content + '\n');

    console.log(`===========================================`);
};

// Initialize the mail data
let emails : string[] = [];
let fileIO = fs.readFileSync(CONFIG.mailDataFile, 'utf-8');
emails = fileIO.split(',').map(backSpaceFilter);


interface sendEmailPackage {
    transporter : nodemailer.Transporter,
    message     : object
}

function prepareSendEmail(index : any) : sendEmailPackage {

    let random = getRandomSection(0, CONFIG.subjects.length-1);

        let message : object = {
            from : CONFIG.username,
            to : emails[index],
            subject : CONFIG.subjects[random],
            html : emailContentGenerator(),
            dsn : {
                id : crypto.createHash('sha1').update(CONFIG.username || "").digest('hex'),
                return : 'headers',
                notify: ['success', 'failure', 'delay'],
                recipient : CONFIG.username
            }
        }

        let _transporter = nodemailer.createTransport({
            host : CONFIG.mailHost,
            port : 465,
            secure : true,
            auth : {
                user : CONFIG.username,
                pass : CONFIG.password
            },
            tls : {
                rejectUnauthorized : false
            },
            debug : true
        });

        return {
            transporter: _transporter,
            message : message
        }
}



//==================main========================
async function __main__() {

    const sendMail = async (transporter : nodemailer.Transporter, msg : any) => {
        return new Promise(resolve => {
            setTimeout(async () => {
                let info = await transporter.sendMail(msg)
                resolve(info);
            }, 10000);
        });
    };

    for(let x in emails) {

        let {transporter, message} = prepareSendEmail(x);
    
        let verify = await transporter.verify();

        if(verify) {
            console.log('=========Email Verify Success!=========\n');
        }else{
            throw new Error('Email Verifiy Faild: ' + verify);
        }
        
        let result = await sendMail(transporter, message);
        console.log(result);

        transporter.close();

    }

}
//==================main========================

__main__();