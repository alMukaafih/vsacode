/**
 * Click handler for files app
 * @param {MouseEvent} e 
 * @returns 
 */
function clickHandler(e: MouseEvent) {
    acode.exec('open-folder');
    return;
}

/**
 * Initialize the app
 * @param app 
 */
export function initApp(app: HTMLElement) {
    let span = document.createElement("span")
    span.append("VS Acode")
    span.classList.add("title")
    let header = document.createElement("div")
    header.append(span)
    header.classList.add("header")
    app.append(header)
    //app.classList.add("files")
    //app.setAttribute("data-msg", "Select VS Code Extension")
    //sapp.addEventListener('click', clickHandler);
}