
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

const hebrewLetters = [
    'א', 'ב', 'ג', 'ד', 'ה', 
    'ו', 'ז', 'ח', 'ט', 'י', 
    'כ', 'ל', 'מ', 'נ', 'ס', 
    'ע', 'פ', 'צ', 'ק', 'ר', 
    'ש', 'ת',
    'ך', 'ם', 'ן', 'ף', 'ץ'
];

const niqqudCharacters = [
    '\u05B0', // Shva

    '\u05B1', // Reduced Segol
    '\u05B2', // Reduced Patach
    '\u05B3', // Reduced Kamatz

    '\u05B4', // Hiriq
    '\u05B5', // Tzere
    '\u05B6', // Segol
    '\u05B7', // Patach
    '\u05B8', // Kamatz
    'ו' + '\u05B9', // Holam Male
    '\u05B9', // Holam Haser
    '\u05BB', // Kubutz
    'ו' + '\u05BC', // Shuruk
    ''
];

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
    "dfus": hebrewLetters,
    "ktav": hebrewLetters,
    "niqqud": niqqudCharacters.map((x) => 'א' + x)
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
        var cardDiv = document.getElementById("card");

        if (window.getComputedStyle(settingsDiv).display === "block") {
            settingsDiv.style.display = "none";
            cardDiv.style.display = "flex";
        } else {
            createCheckboxes();
            settingsDiv.style.display = "block";
            cardDiv.style.display = "none";
        }
    }

    document.getElementById("show_settings").addEventListener('click', toggleSettingsMenu);
    document.getElementById("settings_cancel").addEventListener('click', toggleSettingsMenu);
    document.getElementById("settings_ok").addEventListener('click', function(){
        saveSettings(settings);
        toggleSettingsMenu();
    });
    createCheckboxes();

    return settings;
}
