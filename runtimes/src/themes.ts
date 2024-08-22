const settings = acode.require("settings");
declare var editorManager: { editor: AceAjax.Editor };
const { editor } = editorManager;

type Themes = {
    id: string;
    name: string;
};

export class Runtime {
    #themes: string[] = [];

    async init(themes: Themes[]) {
        const ThemeBuilder = acode.require("ThemeBuilder");
        for (const theme of themes) {
            this.#themes.push(theme.id);
            let content: string = (await import(`themes/${theme.id}.js`))
                .content;
            let _theme = ThemeBuilder.fromJSON(content);
            let _themes = acode.require("themes");
            _themes.add(_theme);

            content = (await import(`themes/${theme.id}.css`)).content;
            ace.define(
                `ace/theme/${theme.id}.css`,
                ["require", "exports", "module"],
                function (
                    _require: any,
                    _exports: any,
                    module: { exports: string }
                ) {
                    module.exports = content;
                }
            ),
                ace.define(
                    `ace/theme/${theme.id}`,
                    [
                        "require",
                        "exports",
                        "module",
                        `ace/theme/${theme.id}.css`,
                        "ace/lib/dom",
                    ],
                    function (
                        require: (arg0: string) => any,
                        exports: {
                            isDark: boolean;
                            cssClass: string;
                            cssText: any;
                        },
                        _module: any
                    ) {
                        (exports.isDark = !0),
                            (exports.cssClass = `ace-${theme.id}`),
                            (exports.cssText = require(`./${theme.id}.css`));
                        const dom = require("../lib/dom");
                        dom.importCssString(
                            exports.cssText,
                            exports.cssClass,
                            !1
                        );
                    }
                );
            (function () {
                window.require(["ace/theme/" + theme.id], function (m: any) {
                    if (
                        typeof module == "object" &&
                        typeof exports == "object" &&
                        module
                    ) {
                        module.exports = m;
                    }
                });
            })();

            ace.require("ace/ext/themelist").themes.push({
                caption: theme.name,
                theme: "ace/theme/" + theme.id,
                isDark: true,
            });

            const currentTheme = settings.get("editorTheme");
            if (currentTheme === theme.id)
                editor.setTheme("ace/theme/" + theme.id);
            settings.on("update", this.onThemeChange);
        }
    }

    onThemeChange(value: string) {
        if (value in this.#themes) {
            editor.setTheme("ace/theme/" + value);
            settings.update({ editorTheme: value }, true);
        }
    }
}

export default {
    Runtime,
};
