/// <reference path="acode.d.ts" />
/// <reference path="config.d.ts" />
/// <reference path="vsacode.d.ts" />
/// <reference types="ace" />
declare global {
    interface Window {
        toast(message: string, duration: number): void;
    }
}
export {};