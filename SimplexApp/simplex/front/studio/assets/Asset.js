export class AssetType {
    static folder = new AssetType("Folder", "folder", "#0000003F");
    static sprite = new AssetType("Sprite", "palette", "#F06292");
    static sound = new AssetType("Sound", "volume_up", "#E57373");
    static font = new AssetType("Font", "format_size", "#A1887F");
    static script = new AssetType("Script", "receipt", "#81C784");
    static object = new AssetType("Object", "center_focus_strong", "#64B5F6");
    static scene = new AssetType("Scene", "dashboard", "#BA68C8");

    static type = {
        "folder" : AssetType.folder,
        "sprite" : AssetType.sprite,
        "sound" : AssetType.sound,
        "font" : AssetType.font,
        "script" : AssetType.script,
        "object" : AssetType.object,
        "scene" : AssetType.scene,
        0 : AssetType.folder,
        1 : AssetType.sprite,
        2 : AssetType.sound,
        3 : AssetType.font,
        4 : AssetType.script,
        5 : AssetType.object,
        6 : AssetType.scene,
    }

    constructor(name, icon, color) {
        this.name = name;
        this.icon = icon;
        this.color = color;
    }
}

export class Asset {

    // TreeView Visibility
    text;
    icon;
    color;

    constructor(name, type) {
        this.type = type;
        this.name = name;
        this.text = name;
        this.icon = type.icon;
        this.color = type.color;
    }
}