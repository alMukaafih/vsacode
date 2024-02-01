type Strings = string[];
declare var ace: Ace;

interface Ace {
        /**
    * Define a module
    * @param {string} name
    * @param {Object|function} module
    */
    require(module: string): any;
}