# Auto email sender


Auto email sender is a cross-plaftform tool to help you drop into the EDM easily over NodeJS. It supports various functions now:


- Multi-subject
- Multi-signature
- Braces variables
- Random nickname generator
- Email validator (Based on SMTP protocol)
- Email extractor


![](https://img.shields.io/badge/license-MIT-brightgreen)
![](https://img.shields.io/badge/language-TypeScript-blue)
## Requirements  

- `Node.js 17+`

## Documentation

FAQ and More details on [https://sumku404.github.io/Auto-email-sender/](https://sumku404.github.io/Auto-email-sender/)

## Usage

Firstly, You need get the source code from github (clone):

```bash
git clone https://github.com/sumku404/Auto-email-sender.git
```

or

clicking the `code` button on the Auto Email Sender's home page; then tap `Download Zip`.
When you do this properly, you'll find a directory named `Auto-email-sender` in your folder.

We need a **text editor**, or **code editor** anyway, for editing the configuration file. Please be cautious! DO NOT USE Microsoft Notebook, because that shit stuff can destroy everything out, even your computer, I'm not kidding. As you save a plain text file, Microsoft Notebook will ridiculously add some special characters in your file header. So I strongly recommend using `Visual Studio Code` instead.

Next, we've been demanded to configure the application before running it. Entering the `Auto-email-sender` directory, open `src/config.ts` file with **VS code**.

We'll fill in some params: `username`, `password`, and `mailHost`.

- username: Email account.
- password: if your email system has support **authorization code**, you need to use it instead.
- mailHost: your email system SMTP server.

We didn't have target emails yet, so let's add some of. Opening `static/customerEmails.csv` , add some emails to which you want to send. Now, running **Auto Email Sender** in your console, you could use ``` Ctrl + ` ``` to open the terminal in VS code.

```bash
npm run app
```

Checking your mailbox if receive an email. Further advanced features, visit [Document](https://sumku404.github.io/Auto-email-sender/).

---

## References

- [SMTP Protocol - Simple Mail Transfer Protocol](https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol)
- [Nodemailer](https://nodemailer.com/about/)
