import { Runtime } from "vsacode"
import { HOME } from "../lib/constants.js";
const fileBrowser = acode.require("fileBrowser")
const fs = acode.require("fs")

/**
 * Click handler for files app
 * @param {MouseEvent} e
 * @returns
 */
async function clickHandler(e: MouseEvent) {
    const myFile = await fileBrowser('file', 'Select VS Code Extension', true)
    const env = { home: HOME }
    const file = await fs(myFile.url).readFile()
    const runtime = new Runtime(env)
    runtime.run()
}

/**
 * Initialize the app
 * @param app
 */
export function initApp(app: HTMLElement) {
    let span = document.createElement("span")
    span.append("EXTENSIONS")
    span.classList.add("vsacode-title")

    let installed = document.createElement("div")
    installed.append("INSTALLED")


    let header = document.createElement("div")
    header.append(span)
    header.classList.add("header")
    app.append(header)
    app.classList.add("files")
    app.setAttribute("data-msg", "Select VS Code Extension")
    app.addEventListener('click', clickHandler);
}