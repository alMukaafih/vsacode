/// <reference path="acode.d.ts" />
/// <reference path="configToml.d.ts" />
/// <reference path="iconTheme.d.ts" />
/// <reference path="map.d.ts" />
/// <reference path="vsacode.d.ts" />
/// <reference types="ace" />
declare global {
    interface Window {
        toast(message: string, duration: number): void;
    }
}
export {};