const { spawn } = require('child_process');

const command = 'npm'; // Replace 'ls' with your desired command
const args = ['test']; // Replace with command arguments

const childProcess = spawn(command, args);

// Pipe the child process stdout to process.stdout
childProcess.stdout.pipe(process.stdout);

// Handle errors, if any
childProcess.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

// Handle the child process exit event
childProcess.on('exit', (code, signal) => {
  if (code !== null) {
    console.log(`Child process exited with code ${code}`);
  } else if (signal !== null) {
    console.log(`Child process killed by signal ${signal}`);
  }
});
