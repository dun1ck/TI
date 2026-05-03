// Функция для проверки взаимной простоты
function gcd(a, b) {
    while (b !== 0) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

// Поиск обратного числа по модулю 26 (для расшифровки)
function modInverse(a, m) {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
    }
    return -1;
}

// Шифрование децимацией (только латинские буквы)
function decryptDecimation(text, key) {
    if (gcd(key, 26) !== 1) {
        alert("Ошибка: ключ должен быть взаимно прост с 26!");
        return "";
    }
    let result = "";
    for (let ch of text) {
        const code = ch.charCodeAt(0);
        if (code >= 65 && code <= 90) { // A-Z
            let newCode = ((code - 65) * key) % 26 + 65;
            result += String.fromCharCode(newCode);
        } else if (code >= 97 && code <= 122) { // a-z
            let newCode = ((code - 97) * key) % 26 + 97;
            result += String.fromCharCode(newCode);
        } else {
            result += ch; // не-буквы оставляем как есть
        }
    }
    return result;
}

// Расшифрование децимацией
function encryptDecimation(text, key) {
    const invKey = modInverse(key, 26);
    if (invKey === -1) {
        alert("Ошибка: невозможно найти обратный ключ по модулю 26");
        return "";
    }
    let result = "";
    for (let ch of text) {
        const code = ch.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            let newCode = ((code - 65) * invKey) % 26 + 65;
            result += String.fromCharCode(newCode);
        } else if (code >= 97 && code <= 122) {
            let newCode = ((code - 97) * invKey) % 26 + 97;
            result += String.fromCharCode(newCode);
        } else {
            result += ch;
        }
    }
    return result;
}

// Функция нормализации русской буквы в число 0..32 (33 буквы с Ё)
function rusCharToIndex(ch) {
    const upperMap = {
        'А':0,'Б':1,'В':2,'Г':3,'Д':4,'Е':5,'Ё':6,'Ж':7,'З':8,'И':9,'Й':10,
        'К':11,'Л':12,'М':13,'Н':14,'О':15,'П':16,'Р':17,'С':18,'Т':19,'У':20,
        'Ф':21,'Х':22,'Ц':23,'Ч':24,'Ш':25,'Щ':26,'Ъ':27,'Ы':28,'Ь':29,'Э':30,'Ю':31,'Я':32
    };
    const lowerMap = {
        'а':0,'б':1,'в':2,'г':3,'д':4,'е':5,'ё':6,'ж':7,'з':8,'и':9,'й':10,
        'к':11,'л':12,'м':13,'н':14,'о':15,'п':16,'р':17,'с':18,'т':19,'у':20,
        'ф':21,'х':22,'ц':23,'ч':24,'ш':25,'щ':26,'ъ':27,'ы':28,'ь':29,'э':30,'ю':31,'я':32
    };
    if (upperMap[ch] !== undefined) return { index: upperMap[ch], isLower: false };
    if (lowerMap[ch] !== undefined) return { index: lowerMap[ch], isLower: true };
    return null;
}

// Обратное преобразование: индекс и регистр -> буква
function indexToRusChar(index, isLower) {
    const upperChars = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
    const lowerChars = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
    if (isLower) return lowerChars[index];
    return upperChars[index];
}

// Шифрование Виженера
function vigenereEncrypt(text, keyword) {
    // Преобразуем ключ в последовательность сдвигов (только русские буквы)
    let keyShifts = [];
    for (let ch of keyword) {
        let res = rusCharToIndex(ch);
        if (res !== null) keyShifts.push(res.index);
    }
    if (keyShifts.length === 0) {
        alert("Ключ должен содержать хотя бы одну русскую букву!");
        return text;
    }

    let result = "";
    let keyIdx = 0;
    for (let ch of text) {
        let charInfo = rusCharToIndex(ch);
        if (charInfo === null) {
            result += ch; // не-буквы не шифруем
            continue;
        }
        let shift = keyShifts[keyIdx % keyShifts.length];
        let newIndex = (charInfo.index + shift) % 33;
        result += indexToRusChar(newIndex, charInfo.isLower);
        keyIdx++;
    }
    return result;
}

// Расшифрование Виженера
function vigenereDecrypt(text, keyword) {
    let keyShifts = [];
    for (let ch of keyword) {
        let res = rusCharToIndex(ch);
        if (res !== null) keyShifts.push(res.index);
    }
    if (keyShifts.length === 0) {
        alert("Ключ должен содержать хотя бы одну русскую букву!");
        return text;
    }

    let result = "";
    let keyIdx = 0;
    for (let ch of text) {
        let charInfo = rusCharToIndex(ch);
        if (charInfo === null) {
            result += ch;
            continue;
        }
        let shift = keyShifts[keyIdx % keyShifts.length];
        let newIndex = (charInfo.index - shift + 33) % 33;
        result += indexToRusChar(newIndex, charInfo.isLower);
        keyIdx++;
    }
    return result;
}

// Чтение файла и вставка в textarea
function loadFileIntoTextarea(fileInput, textareaId) {
    const file = fileInput.files[0];
    if (!file) {
        alert("Выберите файл");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById(textareaId).value = e.target.result;
    };
    reader.onerror = function() {
        alert("Ошибка чтения файла");
    };
    reader.readAsText(file, "UTF-8");
}

// Сохранение содержимого textarea в файл
function saveTextareaToFile(textareaId, defaultFilename) {
    const text = document.getElementById(textareaId).value;
    if (!text) {
        alert("Нет данных для сохранения");
        return;
    }
    const blob = new Blob([text], {type: "text/plain"});
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
document.getElementById("decLoadFile").addEventListener("click", () => {
    const fileInput = document.getElementById("decFileInput");
    loadFileIntoTextarea(fileInput, "decText");
});
document.getElementById("decSaveResult").addEventListener("click", () => {
    saveTextareaToFile("decResult", "decimation_result.txt");
});
document.getElementById("decEncrypt").addEventListener("click", () => {
    const text = document.getElementById("decText").value;
    const key = parseInt(document.getElementById("decKey").value);
    if (isNaN(key)) {
        alert("Введите числовой ключ");
        return;
    }
    if (gcd(key, 26) !== 1) {
        alert("Ключ должен быть взаимно прост с 26 (например, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25)");
        return;
    }
    const result = encryptDecimation(text, key); // Внимание: в моих функциях шифрование = умножение на ключ
    document.getElementById("decResult").value = result;
});
document.getElementById("decDecrypt").addEventListener("click", () => {
    const text = document.getElementById("decText").value;
    const key = parseInt(document.getElementById("decKey").value);
    if (isNaN(key)) {
        alert("Введите числовой ключ");
        return;
    }
    const result = decryptDecimation(text, key);
    document.getElementById("decResult").value = result;
});

document.getElementById("vigLoadFile").addEventListener("click", () => {
    const fileInput = document.getElementById("vigFileInput");
    loadFileIntoTextarea(fileInput, "vigText");
});
document.getElementById("vigSaveResult").addEventListener("click", () => {
    saveTextareaToFile("vigResult", "vigenere_result.txt");
});
document.getElementById("vigEncrypt").addEventListener("click", () => {
    const text = document.getElementById("vigText").value;
    const keyword = document.getElementById("vigKey").value;
    if (!keyword) {
        alert("Введите ключевое слово");
        return;
    }
    const result = vigenereEncrypt(text, keyword);
    document.getElementById("vigResult").value = result;
});
document.getElementById("vigDecrypt").addEventListener("click", () => {
    const text = document.getElementById("vigText").value;
    const keyword = document.getElementById("vigKey").value;
    if (!keyword) {
        alert("Введите ключевое слово");
        return;
    }
    const result = vigenereDecrypt(text, keyword);
    document.getElementById("vigResult").value = result;
});