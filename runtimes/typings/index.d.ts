/// <reference path="acode.d.ts" />
/// <reference path="ace.d.ts" />
/// <reference types="ace" />
/// <reference path="requirejs.d.ts" />

declare global {
    interface Window {
        toast(message: string, duration: number): void;
    }
}
export {};