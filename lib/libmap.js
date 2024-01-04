class MapIcons {
    constructor(txt_1, txt_2="", on=true) {
        this.x = txt_1;
        this.y = txt_2;
        this.z = "::before";
        this.switch = on;
    }
    map(map1, map2, map0) {
        this.map1 = map1;
        this.map2 = map2;
        this.map0 = map0;
        for([this.key, this.value] of Object.entries(this.map1)) {
            if (this.map0[this.value] == undefined)
                continue;
            if (this.value.includes("-"))
                this.value = this.value.replace(/-/g, '_');
            if (this.map2[this.value] == undefined)
                this.map2[this.value] = [];
            if (this.switch == true && this.key.includes("."))
                this.key = this.key.replace(/\./g, '_');
            this.key = this.x + this.key + this.y + this.z;
            this.map2[this.value].push(this.key);
        }
        return this.map2;
    }
}