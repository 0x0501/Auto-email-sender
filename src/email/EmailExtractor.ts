import fs from 'fs';

class EmailExtractor {

    public static EMAIL_SOURCE_FILE_PATH : string  = './static/record.txt';

    public static EMAIL_EXPORT_FILE_PATH : string = './static/extract_emails.txt';

    public static extract() {
        fs.readFile(this.EMAIL_SOURCE_FILE_PATH, {
            encoding : 'utf-8'
        }, (err, data) => {
            if (err) throw new Error('No such file or dictorary: ' + this.EMAIL_SOURCE_FILE_PATH);

            let emails = data.match(/([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g);
            
            let dataSet = Array.from(new Set(emails).values()).join(',\n');

            fs.writeFileSync(this.EMAIL_EXPORT_FILE_PATH, dataSet);
        });
    }

}

export default EmailExtractor;