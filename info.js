const fs = require('fs');
const path = require('path');
const readline = require('readline');

const LOG_DIR = path.join(__dirname, 'logs');
const filePath = path.join(LOG_DIR, 'info.txt')

// Keep track of the last size of the file
let lastSize = 0;

// Function to read the new lines from the file
const readNewLines = (fileDescriptor, start) => {
  const rl = readline.createInterface({
    input: fs.createReadStream(null, { fd: fileDescriptor, start, autoClose: false }),
    crlfDelay: Infinity,
  });

  rl.on('line', (line) => {
    console.log(line);
  });

  rl.on('close', () => {
    // Update the last size to the current size
    fs.stat(filePath, (err, stats) => {
      if (err) throw err;
      lastSize = stats.size;
    });
  });
};

// Watch for changes in the file
fs.watch(filePath, (eventType) => {
  if (eventType === 'change') {
    // Get the new size of the file
    fs.stat(filePath, (err, stats) => {
      if (err) throw err;

      if (stats.size > lastSize) {
        // Read the new lines added to the file
        fs.open(filePath, 'r', (err, fd) => {
          if (err) throw err;
          readNewLines(fd, lastSize);
        });
      }
    });
  }
});

// Initial check to set the lastSize
fs.stat(filePath, (err, stats) => {
  if (err) throw err;
  lastSize = stats.size;
});
