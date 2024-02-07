/**
 * A module that generates files
 * @module libmap
 * @author alMukaafih
 */
/**
 * @typedef {object} Map
 */
import { ArrayMap, ObjectMap, StringMap } from "./libutils.js"
/**
 * Creates a new Map Blueprint
 * @class MapFileIcons
 * @param {string} txt_1 - CSS class name prefix
 * @param {string} [txt_2] - CSS class name suffix
 * @param {string} [isFile=true] - it is a File and not a Folder
 */
export class MapFileIcons {
    x: string;
    y: string;
    z: string;
    isFile: boolean;
    map0: ObjectMap;
    map1: StringMap
    map2: ArrayMap;
    key: string;
    value: string;
    constructor(txt_1, txt_2="", isFile=true) {
        /** Prefix */
        this.x = txt_1;
        /** Suffix */
        this.y = txt_2;
        /** ::before string */
        this.z = "::before";
        /** Switch */
        this.isFile = isFile;
    }
    /** Maps Map1 to Map2
     * @param {Map} map1 - MapX
     * @param {Map} map2 - MapY
     * @param {Map} map0 - Main map
     * @returns {Map} 
     */
    map(map1, map2, map0) {
        this.map1 = map1;
        this.map2 = map2;
        this.map0 = map0;
        for([this.key, this.value] of Object.entries(this.map1)) {
            if (this.map0[this.value] == undefined)
                continue;
            if (this.map2[this.value] == undefined)
                this.map2[this.value] = [];
            if (this.isFile == true && this.key.includes("."))
                this.key = this.key.replace(/\./g, '_');
            if (this.isFile == true && this.key.includes(" "))
                this.key = this.key.replace(/ /g, '-_');
            if (this.isFile == true)
                this.key = "f_" + this.key;
            this.key = this.x + this.key + this.y + this.z;
            this.map2[this.value].push(this.key);
        }
        return this.map2;
    }
}