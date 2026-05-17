// LFSR-28 с полиномом x^28 + x^3 + 1
// Обратные связи: биты 27 и 24 (0-based индексация с 0)

class LFSR28 {
    constructor(initialState) {
        if (initialState.length !== 28 || !/^[01]{28}$/.test(initialState)) {
            throw new Error('Начальное состояние должно быть строкой из 28 символов 0 и 1');
        }
        this.state = initialState.split('').map(bit => parseInt(bit, 10));
    }

    // Генерация одного бита ключа
    nextBit() {
        // feedback = x28 XOR x25 (1-based) -> в 0-based: бит 27 XOR бит 24
        const feedback = this.state[27] ^ this.state[24];
        // Сдвиг вправо
        this.state.pop();
        this.state.unshift(feedback);
        return feedback;
    }

    // Генерация байта ключа (8 бит)
    nextByte() {
        let byte = 0;
        for (let i = 0; i < 8; i++) {
            byte = (byte << 1) | this.nextBit();
        }
        return byte;
    }

    // Генерация ключа нужной длины в байтах
    generateKey(lengthInBytes) {
        const key = new Uint8Array(lengthInBytes);
        for (let i = 0; i < lengthInBytes; i++) {
            key[i] = this.nextByte();
        }
        return key;
    }
}

// DOM элементы
const initialStateInput = document.getElementById('initialState');
const fileInput = document.getElementById('fileInput');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const keyDisplay = document.getElementById('keyDisplay');
const originalDisplay = document.getElementById('originalDisplay');
const resultDisplay = document.getElementById('resultDisplay');
const statusDiv = document.getElementById('status');

let currentFileData = null;
let currentFileName = null;

// Фильтр ввода только 0 и 1
initialStateInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^01]/g, '').slice(0, 28);
});

// Загрузка файла в память
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    currentFileName = file.name;
    const reader = new FileReader();

    reader.onload = (e) => {
        currentFileData = new Uint8Array(e.target.result);
        displayBinaryWithEdges(originalDisplay, currentFileData);
        statusDiv.textContent = `Файл "${currentFileName}" загружен. Размер: ${currentFileData.length} байт`;
    };

    reader.onerror = () => {
        statusDiv.textContent = 'Ошибка чтения файла';
        currentFileData = null;
    };

    reader.readAsArrayBuffer(file);
});

// Функция для преобразования байтов в бинарную строку
function bytesToBinaryString(data, maxBytes = 32) {
    let binaryString = '';
    const bytesToShow = Math.min(data.length, maxBytes);

    for (let i = 0; i < bytesToShow; i++) {
        binaryString += data[i].toString(2).padStart(8, '0');
        if ((i + 1) % 4 === 0 && i !== bytesToShow - 1) {
            binaryString += ' ';
        }
    }

    return binaryString;
}

// Функция для отображения первых и последних бит
function displayBinaryWithEdges(displayElement, data) {
    if (!data || data.length === 0) {
        displayElement.textContent = '(нет данных)';
        return;
    }

    const totalBytes = data.length;
    const bytesToShow = Math.min(32, totalBytes);

    // Получаем первые байты
    const firstBytes = data.slice(0, bytesToShow);
    const firstBinary = bytesToBinaryString(firstBytes, bytesToShow);

    // Если файл маленький (меньше или равен 64 байтам), показываем всё
    if (totalBytes <= 64) {
        displayElement.textContent = firstBinary;
        return;
    }

    // Получаем последние байты
    const lastBytes = data.slice(totalBytes - bytesToShow, totalBytes);
    const lastBinary = bytesToBinaryString(lastBytes, bytesToShow);

    // Формируем вывод без лишних надписей
    const output = `${firstBinary}\n\n...\n\n${lastBinary}`;
    displayElement.textContent = output;
}

// Основная функция шифрования/дешифрования
async function processFile(encryptMode) {
    if (!currentFileData) {
        statusDiv.textContent = 'Сначала выберите файл';
        return;
    }

    const initialState = initialStateInput.value.trim();
    if (initialState.length !== 28) {
        statusDiv.textContent = 'Введите 28 бит начального состояния (только 0 и 1)';
        return;
    }

    try {
        // Создаем LFSR и генерируем ключ
        const lfsr = new LFSR28(initialState);
        const key = lfsr.generateKey(currentFileData.length);

        // Отображаем ключ
        displayBinaryWithEdges(keyDisplay, key);

        // XOR файла с ключом
        const result = new Uint8Array(currentFileData.length);
        for (let i = 0; i < currentFileData.length; i++) {
            result[i] = currentFileData[i] ^ key[i];
        }

        // Отображаем результат
        displayBinaryWithEdges(resultDisplay, result);

        // Сохраняем результат на диск
        const suffix = encryptMode ? '.encrypted' : '.decrypted';
        let outputFileName = currentFileName + suffix;

        if (!encryptMode && currentFileName.endsWith('.encrypted')) {
            outputFileName = currentFileName.slice(0, -10);
            if (!outputFileName) outputFileName = 'decrypted_output';
        }

        downloadFile(result, outputFileName);

        const action = encryptMode ? 'Зашифрован' : 'Расшифрован';
        statusDiv.textContent = `${action} файл сохранён как "${outputFileName}"`;

    } catch (error) {
        statusDiv.textContent = `Ошибка: ${error.message}`;
        console.error(error);
    }
}

// Скачивание файла
function downloadFile(data, filename) {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Обработчики кнопок
encryptBtn.addEventListener('click', () => processFile(true));
decryptBtn.addEventListener('click', () => processFile(false));

// Инициализация начальным значением для примера
initialStateInput.value = '1010101010101010101010101010';