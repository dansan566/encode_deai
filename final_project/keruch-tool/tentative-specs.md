# Final Project: Interactive Solidity Developer

This tool will help efficiently write, review, deploy, and interact with Solidity contracts. 
## User interface
### Description by `@keruch`
I imagine the UX of 4 pieces:

1. **Left window**—AI model that is a Solidity Developer. It is a chat-like window where one can interact with a model instructioned to be a Solidity dev. It writes Solidity code and outputs it at the middle window.
2. **Middle window**—Solidity code editor. Model outputs its code here. One can edit the code.
3. **Right window**—AI model that is an Experienced Solidity Auditor. It is a chat-like window where one can interact with a model instructioned to be a Solidity auditor. This model audits the code in the middle window and gives remarks.
4. **Bottom window**—one can connect the wallet and deploy the written above Solidity code. Optionally, interact with the deployed contract in Remix-style.

### AI generated design
![UI](./images/chatgpt_image_apr_13_2025_10_51_03_pm.png)

## First steps: basic app
Let's start with Electron, because VS Code is based on Electron and what we'll do is much like VS Code.

Disclaimer: the code below is made by reading the docs and has not been tested yet as of Monday 14 April 2025.
### Use Type Script
We'll use TypeScript and `ts-node`. 

We check that Node TypeScript and the libraries are installed
``` bash
node -v     # check nodejs is installed
tsc -v      # check typescript compiler is installed
ts-node -v  # check ts-node is installed
# cd to the project folder to check the node_modules
ls node_modules/@types/
```

If we don't have TypeScript already installed, we install it with its development tools
``` bash
npm install --save-dev typescript ts-node @types/node @types/electron
```
- Install `ts-node` (if you plan to run TypeScript directly during development)
- Install the necessary type definitions `@types/node @types/electron`


Then we configure its `tsconfig.json`
``` bash
npx tsc --init --rootDir src --outDir dist --esModuleInterop --module commonjs --target ES2020 --sourceMap
```
- `--rootDir src`: Specifies the root directory for your TypeScript source files.
- `--outDir dist`: Specifies the output directory for the compiled JavaScript files.
- `--esModuleInterop`: Enables interoperability between CommonJS and ES Modules.
- `--module commonjs`: Specifies the module code generation. Electron primarily uses CommonJS.
- `--target ES2020`: Specifies the ECMAScript target version. Choose a modern version that Electron supports well.
- `--sourceMap`: Generates source map files for easier debugging.


### Initialise Electron Project Files


``` bash
mkdir ai-solidity-ide           # create project folder
cd ai-solidity-ide              # go to the folder
npm init -y                     # initialize project
npm install --save-dev electron # install electron and dependencies
```

### Configure `npm` Start Script
The command `npm init` has created a `package.json` file. We modify it to include scripts for building our TypeScript code and starting the Electron application.

The Start Script is 
``` json
{
  "name": "ai-solidity-ide",
  "version": "0.0.1",
  "description": "An interactive AI-powered Solidity coding tool built with Electron and TypeScript",
  "main": "dist/main.js",
  "scripts": {
    "build": "tsc",
    "start": "npm run build && electron ."
  },
  "author": "Group 8 of DeAI bootcamp",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^...",
    "electron": "^...",
    "typescript": "^..."
  }
}
``` 
- `build`: Compiles your TypeScript code.
- `start`: Runs the build script and then starts the Electron application. The `.` refers to the current directory, which should contain the compiled `main.js`

### Basic Electron application code `dist/main`

``` TypeScript
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 920,
    webPreferences: {
      nodeIntegration: true,    // Allows Node.js integration in the renderer process (for now)
      contextIsolation: false,  // Disable context isolation for simplicity in this initial setup
      preload: path.join(__dirname, 'preload.js'), // Optional: for more secure context bridging
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../index.html')); // Assuming your HTML is in the root
  // Or load a URL: mainWindow.loadURL('https://example.com');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

### Basic HTML page
``` html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Interactive Solidity Code Tool</title>
</head>
<body>
  <h1>Welcome to the Interactive Solidity Code Tool!</h1>
  <div id="app"></div>
  <script src="./dist/renderer.js"></script> </body>
</html>
```

### Create our Renderer Process TypeScript (renderer.ts):

Create a `dist/renderer.ts` file:
``` Bash
touch dist/renderer.ts
``` 
Add some basic content to `dist/renderer.ts`:
``` TypeScript
document.addEventListener('DOMContentLoaded', () => {
  const appDiv = document.getElementById('app');
  if (appDiv) {
    appDiv.textContent = 'This is running in the renderer process!';
  }
});
``` 

### Run the Basic Electron App:

Execute the following commands in our terminal:
``` Bash
npm install 
``` 
Think of `npm install` as setting up the toolbox for our project. WE need to gather all the necessary tools (dependencies) before WE can start building. WE only need to run `npm install` when the contents of our toolbox configuration (`package.json`) have changed or if the toolbox itself (`node_modules`) is missing. For simply running our already set-up project, WE don't need to run it repeatedly.

``` Bash
npm start

This should compile the TypeScript and open a basic Electron window displaying "Welcome to the Interactive Solidity Code Tool!" and "This is running in the renderer process!".

