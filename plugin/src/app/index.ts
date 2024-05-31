const fileBrowser = acode.require("fileBrowser")
/**
 * Click handler for files app
 * @param {MouseEvent} e
 * @returns
 */
async function clickHandler(e: MouseEvent) {
    const myFile = await fileBrowser('file', 'Select VS Code Extension', true)
    return;
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
    //app.classList.add("files")
    //app.setAttribute("data-msg", "Select VS Code Extension")
    //sapp.addEventListener('click', clickHandler);
}