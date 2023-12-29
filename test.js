const path = require('path');

const filePath = './dist/2023/light/theme.json';

// Using path.dirname to get the parent directory of the file
const parentDirectory = path.dirname(filePath);

console.log('Path of the parent directory:', parentDirectory);
