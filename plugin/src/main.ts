import plugin from "../plugin.json";

class Vsacode {
    // Base url
    public baseUrl: string | undefined;
    // Plugin initialization
    async init(): Promise<void> {

    }
    async destroy(): Promise<void> {

    }
}

if (window.acode) {
    const vsacode = new Vsacode();
    acode.setPluginInit(
        plugin.id,
        async (
            baseUrl: string,
            $page: AcodeApi.WCPage,
            { cacheFileUrl, cacheFile }: any
        ) => {
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }
            vsacode.baseUrl = baseUrl;
            await vsacode.init();
        }
    );
    acode.setPluginUnmount(plugin.id, () => {
        vsacode.destroy();
    });
}