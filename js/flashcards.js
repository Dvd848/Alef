
//
// Utility Functions
//

function randomIntFromInterval(min, max) { // min and max included 
   return Math.floor(Math.random() * (max - min + 1) + min)
}
 
function getRandomArrayElement(array) {
    const index = randomIntFromInterval(0, array.length - 1);
    return array[index];
}

// https://stackoverflow.com/questions/2450954/
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

//
// Hebrew
//

const hebrewLetters = {
    'א': 'alef',
    'ב': 'bet',
    'ג': 'gimel',
    'ד': 'daled',
    'ה': 'hey',
    'ו': 'vav',
    'ז': 'zain',
    'ח': 'chet',
    'ט': 'tet',
    'י': 'yod',
    'כ': 'kaf',
    'ל': 'lamed',
    'מ': 'mem',
    'נ': 'nun',
    'ס': 'samech',
    'ע': 'ain',
    'פ': 'pe',
    'צ': 'tzadik',
    'ק': 'kuf',
    'ר': 'resh',
    'ש': 'shin',
    'ת': 'taf',
};

// used to populate letter
niqqudCharacters = {
    '\u05B0':"",
    '\u05B1':"hataf_segol",
    '\u05B2':"hataf_patach",
    '\u05B3':"hataf_kamatz",
    '\u05B4':"hirik",
    '\u05B5':"tzere",
    '\u05B6':"segol",
    '\u05B7':"patach",
    '\u05B8':"kamatz",
    '\u05B9':"holam",
    '\u05BB':"kubutz",
    'ו\u05B9':"holam", // Holam Male
    'ו\u05BC':"kubutz", // Shuruk
    '':""
}

// used for lookup for sound
niqqudCharacters2 = {
    '\u05B9':"holam", // Holam Male
    '\u05BC':"kubutz", // Shuruk
}

const niqqudCharactersShin = [
    '\u05C1', // Shin dot (right) 
    '\u05C2', // Shin dot (left) 
];

const niqqudDagesh = [
    '',
    '\u05BC', // Dagesh (or Shuruk)
];

const lettersWithDagesh = [
    'ב', 'כ', 'פ'
];

const noShva = [
    'ה', 'ע', 'א'
    //'ח'
];

const noNiqqud = [
    'ן', 'ף', 'ץ', 'ם'
];

const mapping = {
    "dfus": Object.keys(hebrewLetters),
    "ktav": Object.keys(hebrewLetters),
    "niqqud": Object.keys(niqqudCharacters).map((x) => 'א' + x)
};

//
// Settings
//

class Settings {
    static storageKey = "AlefSettings";
    static fields = ["dfus", "ktav", "niqqud"];
    static eventSettingsSaved = "SettingsSaved";

    constructor() {
        this.allowed = {};
        for (let field of Settings.fields) {
            this.allowed[field] = 0x7FFFFFFF;
        };

        try
        {
            const settings = localStorage.getItem(Settings.storageKey);
            if (settings != null) {
                const data = JSON.parse(settings);
                for (let field of Settings.fields) {
                    if (field in data) {
                        this.allowed[field] = data[field];
                    }
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    getAllowed(field, index) {
        return (this.allowed[field] & (1 << index)) != 0;
    }

    setAllowed(field, index, value) {
        this.allowed[field] = this.allowed[field] & ~(1 << index);
        this.allowed[field] = this.allowed[field] | (Number(value) << index);
    }

    save() {
        const settings = {};
        for (let field of Settings.fields) {
            settings[field] = this.allowed[field];
        };
        localStorage.setItem(Settings.storageKey, JSON.stringify(settings));
        document.dispatchEvent(new Event(Settings.eventSettingsSaved));
    }
}

function createCheckbox(settings, container_id, array) {
    const container = document.getElementById(container_id);
    if (container == null) {
        return;
    }
    container.innerHTML = '';

    for (let i = 0; i < array.length; ++i)
    {
        const letter = array[i];
        const div = document.createElement("div");
        div.className = "checkbox-item";

        const label = document.createElement("label");
        label.setAttribute("for", `checkbox_${container_id}_${i}`);
        label.textContent = letter;
        label.classList.add(`font_${container_id}`);

        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = `checkbox_${container_id}_${i}`;
        input.name = `checkboxGroup_${container_id}`;
        if (settings.getAllowed(container_id, i)) {
            input.setAttribute("checked", "checked");
        }

        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    }
}

function saveSettings(settings) {
    for (const [field, values] of Object.entries(mapping)) {
        for (let i = 0; i < values.length; ++i) {
            const checkbox = document.getElementById(`checkbox_${field}_${i}`);
            if (checkbox != null) {
                settings.setAllowed(field, i, checkbox.checked);
            }
        }
    }
    settings.save();
}

//
// Main Logic
//

function setup() {
    const settings = new Settings();

    const createCheckboxes = function () {
        for (const [field, values] of Object.entries(mapping)) {
            createCheckbox(settings, field, values);
        }
    }

    const toggleSettingsMenu = function (event) {
        var settingsDiv = document.getElementById("settings");
        var mainDiv = document.getElementById("main");

        if (window.getComputedStyle(settingsDiv).display === "block") {
            settingsDiv.style.display = "none";
            mainDiv.style.display = "flex";
        } else {
            createCheckboxes();
            settingsDiv.style.display = "block";
            mainDiv.style.display = "none";
        }
    }

    function findValueBySubstring(substring) {
        const mergedNiqqudCharacters = { ...niqqudCharacters, ...niqqudCharacters2 };
        for (const [key, value] of Object.entries(mergedNiqqudCharacters)) {
            if (key.charCodeAt(0) === substring) {
                return value;
            }
        }
        return null; // Return null if no match is found
    }

    const playSound = function (event) {
        var txt = document.getElementById("card_content").innerText
        var file_path;
        var letter_name = hebrewLetters[txt[0]];
        if (txt[0] === "ש" && txt.charCodeAt(1) === 1474) {
            letter_name = "sin"
            txt = txt.slice(0, 1) + txt.slice(2);
        }
        if (txt.length > 2) {
            txt = txt[0] + txt[txt.length - 1];
        }
        if (txt.length > 1) {
            var niqud = findValueBySubstring(txt.charCodeAt(1))
            if (!niqud) {
                niqud = "shva";
            }
            file_path = letter_name + "_" + niqud;
        } else {
            file_path = letter_name;
        }
        file_path +=  ".opus";
        const audioElement = document.createElement('audio');
        audioElement.src = `audio/${file_path}`;
        document.body.appendChild(audioElement);
        audioElement.play();
    }

    document.getElementById("show_settings").addEventListener('click', toggleSettingsMenu);
    document.getElementById("settings_cancel").addEventListener('click', toggleSettingsMenu);
    document.getElementById("play_sound").addEventListener('click', playSound);
    document.getElementById("settings_ok").addEventListener('click', function(){
        saveSettings(settings);
        toggleSettingsMenu();
    });
    createCheckboxes();

    return settings;
}
