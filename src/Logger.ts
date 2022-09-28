import fs from 'fs';

class Logger {

    private static LOG_FILE_PATH = './log/running.log';

    private static _logger : Logger;

    private fileStreamTunnelNumber : number;

    private constructor() {
       this.fileStreamTunnelNumber = fs.openSync(Logger.LOG_FILE_PATH, 'a+')
    }

    public static initialize() {
        if (Logger._logger != null) return Logger._logger;

        return new Logger();
    }

    public write(info : string) : Logger {

        let date = new Date();

        let preprocess = `[${date.toLocaleDateString()} ${date.toLocaleTimeString()}] ${info}\n`;
        
        fs.write(this.fileStreamTunnelNumber, preprocess, (err, _writtenNumber, str) => {
            if (err) throw new Error('Write log faild: ' + err.message);
        })

        return this;
    }

    public close() : void {
        // terminate the file stream
        fs.close(this.fileStreamTunnelNumber);
    }


}

export default Logger;