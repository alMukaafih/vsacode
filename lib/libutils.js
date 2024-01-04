function parse(map0) {
    let css = "";
    let classes;
    let style;
    let font = "";
    for(let [key, value] of Object.entries(map0)) {
        if (key == "")
            continue;
        classes = value.join(",");
        style = classes + "{\n"
        + "display: inline-block;\n"
        + `content: '${font}';\n`
        + "background-image: url(${" + key +".default});\n"
        + "background-size: contain;\n"
        + "background-repeat: no-repeat;\n"
        + "height: 1em;\n"
        + "width: 1em;}\n";
        css += style;
    }
    return css;
}

function _require(map, dir) {
    let x = "";
    for(let [key, value] of Object.entries(map)) {
       key = key.replace("-", "_");
       let y = `let ${key} = require(\"${path.join(dir, value.iconPath)}\");\n`;
       x += y;
    }
    return x;
}

function test(name) {
    if (name)
        return name;
    else
        return {"": ""};
}

function _test(name, def="") {
    if (name)
        return name;
    else
        return def;
}

function _css(name, exe = "default", kind = ".file_type_") {
    if (name == "")
        return "";
    let font = "";
    return kind + exe +  "::before {\n"
    + "display: inline-block;\n"
    + `content: '${font}';\n`
    + "background-image: url(${" + name +".default});\n"
    + "background-size: contain;\n"
    + "background-repeat: no-repeat;\n"
    + "height: 1em;\n"
    + "width: 1em;}\n";
}
function validate(map1, map2) {
    for(let [key, value] of Object.entries(map1)) {
        if (map2[value] == undefined) {
            delete map2[value];
        }
    }
}

// exports
module.exports = { parse, _require, test, _test, _css, validate };