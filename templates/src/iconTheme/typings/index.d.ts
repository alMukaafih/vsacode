/// <reference path="acode.d.ts" />
/// <reference types="ace" />
declare global {
    interface Window {
        toast(message: string, duration: number): void;
    }
}
export {};