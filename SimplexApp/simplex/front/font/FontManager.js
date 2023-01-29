import {FontData} from "./FontData.js";

async function loadSystemFontData() {
    try {
        const availableFonts = await window.queryLocalFonts();
        for (const fontData of availableFonts) {
            if (!FontManager.fonts.has(fontData.family)) {
                FontManager.fonts.set(fontData.family, new FontData(fontData.family));
            }
            FontManager.fonts.get(fontData.family).addStyle(fontData.style);
        }
    } catch (err) {
        console.error(err.name, err.message);
    }
}

function loadDocumentFontData() {
    const fontCheck = new Set([
        // Windows 10
        'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS',
        'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi',
        'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console',
        'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei',
        'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei',
        'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI',
        'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic',
        'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman',
        'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
        // macOS
        'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
        'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72',
        'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE',
        'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot',
        'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue',
        'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo',
        'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell',
        'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello',
        'Trebuchet MS', 'Verdana', 'Zapfino',
        // linux distros
        "Bitstream Vera Sans", "Bitstream Vera Mono", "DejaVu", "DejaVu Math TeX Gyre", "DejaVu Sans",
        "DejaVu Sans Mono", "DejaVu Serif", "FreeMono", "FreeSans", "FreeSerif", "Georgia", "Liberation Mono",
        "Liberation Sans", "Liberation Sans Narrow", "Liberation Serif", "Noto Mono", "Nimbus Sans L",
        "Nimbus Roman No9 L", "Nimbus Mono", "Segoe UI", "Verdana", "Ubuntu", "Ubuntu Condensed", "Ubuntu Mono",
        // android
        "Droid Sans", "Droid Serif", "Droid Sans Mono",
    ].sort());

    (async() => {
        await document.fonts.ready;

        for (const font of fontCheck.values()) {
            if (document.fonts.check(`12px "${font}"`)) {
                if (!FontManager.fonts.has(font)) {
                    FontManager.fonts[font] = new FontData(font);
                }
            }
        }
    })();
}

export class FontManager {

    /** @tyle{Map} */ static fonts = new Map();

    static loadDefaultFonts() {
        if ('queryLocalFonts' in window) {
            loadSystemFontData().then((t) => {
                if (!FontManager.fonts.size) {
                    loadDocumentFontData();
                }
            });
        } else {
            loadDocumentFontData();
        }
    }
}