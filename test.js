const readline = require('readline');
const fs = require('fs');
const { execSync } = require('child_process');

const filePath = 'src/exec.sh';

// Read the content of the file
const originalContent = fs.readFileSync(filePath, 'utf8');

// Open an editor (e.g., using the default system editor)
const editorCommand = process.env.EDITOR || 'nano'; // You can change 'vi' to your preferred editor
execSync(`${editorCommand} ${filePath}`, { stdio: 'inherit' });

// Create a readline interface to capture user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Capture modified content
let modifiedContent;
rl.question('File modified. Press Enter to save changes...', () => {
  modifiedContent = fs.readFileSync(filePath, 'utf8');
  rl.close();

  // Compare original and modified content to determine if saving is needed
  if (originalContent !== modifiedContent) {
    // Write the modified content back to the file
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
    console.log('Changes saved successfully.');
  } else {
    console.log('No changes made. File not saved.');
  }
});
