class IconAcode {
    // Base url
    public baseUrl: string | undefined;
    // Plugin initialization
    public async init(): Promise<void> {
        // Appending style element with head
        document.head.insertAdjacentHTML("beforeend",`{% for contrib in contributions %}<script id="{{ contrib.id }}" src="https://localhost/__cdvfile_files-external__/plugins/{{ pluginId }}/{{ contrib.js }}"></script>{% endfor %}`)
    }
    public async destroy(): Promise<void> {

    }
}

if (typeof window.acode != "undefined") {
    const acodePlugin = new IconAcode();
    acode.setPluginInit(
        "{{ pluginId }}",
        async (
            baseUrl: string,
            $page: AcodeApi.WCPage,
            { cacheFileUrl, cacheFile }: any
        ) => {
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }
            acodePlugin.baseUrl = baseUrl;
            await acodePlugin.init();
        }
    );
    acode.setPluginUnmount("{{ pluginId }}", () => {
        acodePlugin.destroy();
    });
}