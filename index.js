const express = require('express');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const app = express();
const PORT = 7001;

const LOG_DIR = path.join(__dirname, 'logs');
const validLogLevels = ["INFO", "WARN", "ERROR", "ALERT", "DEBUG","UNKNOWN"];

const logFiles = {
    INFO: path.join(LOG_DIR, 'info.txt'),
    WARN: path.join(LOG_DIR, 'warn.txt'),
    ERROR: path.join(LOG_DIR, 'error.txt'),
    ALERT: path.join(LOG_DIR, 'alert.txt'),
    DEBUG: path.join(LOG_DIR, 'debug.txt'),
    UNKNOWN: path.join(LOG_DIR, 'unknown.txt'),
};

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

function getRandomTimestampWithinLastYear() {
    const currentDate = new Date();
    const lastYearDate = new Date();
    lastYearDate.setFullYear(currentDate.getFullYear() - 1);
    
    const randomTimestamp = new Date(
        lastYearDate.getTime() + Math.random() * (currentDate.getTime() - lastYearDate.getTime())
    );
    
    return randomTimestamp.toISOString().replace('T', ' ').substring(0, 23);
}

let lastUpdatedTime = 0;
let lastReadPosition = 0;
const logDir1 = '/Users/dipronildas/Desktop/Dipronil/docker/test/readlogs/logs1.txt';
const logDir2 = '/Users/dipronildas/Desktop/Dipronil/docker/test/readlogs/logs2.txt';

const containerInfos = [
    {containerId: 3, meta: "dddqdqwdqfeqw"},
    {containerId: 5, meta: "ffferwriqirqewf"},
    {containerId: 2, meta: "reqnwonqonqnw"},
    {containerId: 1, meta: "qnrnewqrqwnrnq"},
    {containerId: 5, meta: "dddqdqrweqrwdqfeqw"},
    {containerId: 3, meta: "rewqeqwgfsdfsa"},
    {containerId: 2, meta: "dddqreeqwqdqwdqfeqw"},
    {containerId: 4, meta: "qwerqewrewffs"},
    {containerId: 4, meta: "dddqdqafsfafenfnsodanfonaswdqfeqw"},
    {containerId: 4, meta: "dddqdnfnoanfnaqwdqfeqw"},
    {containerId: 3, meta: "dddfwaeonfnwqdqwdqfeqw"},
    {containerId: 3, meta: "dddermfwmfwqdqwdqfeqw"},
    {containerId: 2, meta: "dddefrmewffwqdqwdqfeqw"},
    {containerId: 1, meta: "dddqdqkmnrwqwdqfeqw"},
    {containerId: 1, meta: "dddqdqwmefmwqmfgwqgqwfgdqfeqw"},
    {containerId: 1, meta: "dddqdqwdqfnqwpfqwmnfeqw"},
    {containerId: 3, meta: "dddqdewgw'gfwqegqwdqfeqw"},
    {containerId: 5, meta: "dddqdqmofjwefpqwefqpoqefwdqfeqw"}
];

let allLogs = [];

function getRandomClassName() {
    const classNames = ['com.example.App', 'com.example.Database', 'com.example.Service', 'com.example.Cache'];
    return classNames[Math.floor(Math.random() * classNames.length)];
}

function getRandomContainerInfo() {
    return containerInfos[Math.floor(Math.random() * containerInfos.length)];
}

fs.readFile(path.join(__dirname, 'logs.txt'), 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading logs file:', err);
        return;
    }
    allLogs = data.split('\n').filter(log => log.trim() !== '');
});

cron.schedule('* * * * * *', () => {
    if (allLogs.length === 0) return;

    const randomLogMessage = allLogs[Math.floor(Math.random() * allLogs.length)];

    const parts = randomLogMessage.split(' ');
    const timeStamps = parts.shift(); ;
    const firstPart = parts.shift(); 

    let logLevel;
    let container;
    let messageParts;

    if (validLogLevels.includes(firstPart)) {
        logLevel = firstPart;
        container = parts.shift(); 
        messageParts = parts; 
    } else {
        logLevel = 'UNKNOWN'; 
        container = firstPart; 
        if (validLogLevels.includes(parts[0])) {
            logLevel = parts.shift(); 
        }
        messageParts = parts;
    }

    const message = messageParts.join(' ');

    const logMessage = `${getRandomTimestampWithinLastYear()} ${logLevel} [${container}] - ${message};\n`;
    const logFilePath = logFiles[logLevel];

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        } else {
            // console.log('Log written:', logMessage.trim());
        }
    });
});

// cron.schedule('* * * * * *', () => {
//     if (allLogs.length === 0) return;

//     const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 23);
//     const randomLogMessage = allLogs[Math.floor(Math.random() * allLogs.length)];
//     // const className = getRandomClassName();
//     // const containerInfo = getRandomContainerInfo();

//     const [timeStamps,firstPart, ...messageParts] = randomLogMessage.split(' ');
//     let logLevel, container;
//     if (validLogLevels.includes(firstPart)) {
//         logLevel = firstPart;
//         container = messageParts.shift(); // Container is the next part
//     } else {
//         logLevel = 'UNKNOWN'; // Handle unexpected log level cases
//         container = firstPart; // Container is the first part
//     }

//     const message = messageParts.join(' ');

//     const logMessage = `${timeStamps} ${logLevel} [${container}] - ${message};\n`;
//     fs.appendFile(LOG_FILE_PATH, logMessage, (err) => {
//         if (err) {
//             console.error('Error writing to log file:', err);
//         } else {
//             // console.log('Log written:', logMessage.trim());
//         }
//     });
// });


// cron.schedule('* * * * * *', () => {
//     if (allLogs.length === 0) return;

//     const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 23);
//     const randomLogMessage = allLogs[Math.floor(Math.random() * allLogs.length)];
//     // const className = getRandomClassName();
//     // const containerInfo = getRandomContainerInfo();

//     const [timeStamps,container,logLevel, ...messageParts] = randomLogMessage.split(' ');
//     const message = messageParts.join(' ');

//     const logMessage = `${timeStamps} ${logLevel} [${container}] - ${message};\n`;
//     fs.appendFile(LOG_FILE_PATH_SECOND, logMessage, (err) => {
//         if (err) {
//             console.error('Error writing to log file:', err);
//         } else {
//             // console.log('Log written:', logMessage.trim());
//         }
//     });
// });


const checkLogFile1 = () => {
    fs.stat(LOG_FILE_PATH, (err, stats) => {
        if (err) {
            console.error('Error getting file stats:', err);
            return;
        }
        const currentUpdatedTime = stats.mtime.getTime();
        if (currentUpdatedTime !== lastUpdatedTime) {
            lastUpdatedTime = currentUpdatedTime;

            fs.open(LOG_FILE_PATH, 'r', (openErr, fd) => {
                if (openErr) {
                    console.error('Error opening log file:', openErr);
                    return;
                }

                const buffer = Buffer.alloc(1024);
                fs.read(fd, buffer, 0, buffer.length, lastReadPosition, (readErr, bytesRead, buffer) => {
                    if (readErr) {
                        console.error('Error reading log file:', readErr);
                        fs.close(fd, () => {});
                        return;
                    }

                    if (bytesRead > 0) {
                        const newLogContent = buffer.toString('utf8', 0, bytesRead);
                        lastReadPosition += bytesRead;
                    }

                    fs.close(fd, () => {});
                });
            });
        }
    });
};

// const checkLogFile2 = () => {
//     fs.stat(LOG_FILE_PATH_SECOND, (err, stats) => {
//         if (err) {
//             console.error('Error getting file stats:', err);
//             return;
//         }
//         const currentUpdatedTime = stats.mtime.getTime();
//         if (currentUpdatedTime !== lastUpdatedTime) {
//             lastUpdatedTime = currentUpdatedTime;

//             fs.open(LOG_FILE_PATH_SECOND, 'r', (openErr, fd) => {
//                 if (openErr) {
//                     console.error('Error opening log file:', openErr);
//                     return;
//                 }

//                 const buffer = Buffer.alloc(1024);
//                 fs.read(fd, buffer, 0, buffer.length, lastReadPosition, (readErr, bytesRead, buffer) => {
//                     if (readErr) {
//                         console.error('Error reading log file:', readErr);
//                         fs.close(fd, () => {});
//                         return;
//                     }

//                     if (bytesRead > 0) {
//                         const newLogContent = buffer.toString('utf8', 0, bytesRead);
//                         lastReadPosition += bytesRead;
//                     }

//                     fs.close(fd, () => {});
//                 });
//             });
//         }
//     });
// };

// setInterval(checkLogFile1, 1000);
// setInterval(checkLogFile2, 100);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
