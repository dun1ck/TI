// ---------- МАТЕМАТИКА ----------

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++)
        if (n % i === 0) return false;
    return true;
}

function gcd(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

// расширенный Евклид
function egcd(a, b) {
    if (b === 0) return { g: a, x: 1, y: 0 };
    let { g, x, y } = egcd(b, a % b);
    return { g, x: y, y: x - Math.floor(a / b) * y };
}

// обратный элемент
function modInverse(a, m) {
    let { g, x } = egcd(a, m);
    if (g !== 1) return null;
    return (x % m + m) % m;
}

// быстрое возведение
function modPow(base, exp, mod) {
    let result = 1;
    base %= mod;

    while (exp > 0) {
        if (exp & 1)
            result = (result * base) % mod;

        base = (base * base) % mod;
        exp >>= 1;
    }
    return result;
}

function validateEncrypt(p, q, d) {
    if (!isPrime(p) || !isPrime(q)) {
        alert("p и q должны быть простыми");
        return false;
    }
    if (p === q) {
        alert("p и q не должны совпадать");
        return false;
    }

    let phi = (p - 1) * (q - 1);

    if (d <= 1 || d >= phi) {
        alert("d должно быть в диапазоне (1, φ(n))");
        return false;
    }

    if (gcd(d, phi) !== 1) {
        alert("d должно быть взаимно простым с φ(n)");
        return false;
    }

    return true;
}

function encrypt() {
    let p = +document.getElementById("p").value;
    let q = +document.getElementById("q").value;
    let d = +document.getElementById("d").value;
    let file = document.getElementById("fileEnc").files[0];

    if (!validateEncrypt(p, q, d) || !file) return;

    let n = p * q;
    let phi = (p - 1) * (q - 1);

    let e = modInverse(d, phi);

    if (!e) {
        alert("Не удалось вычислить открытый ключ e");
        return;
    }

    let reader = new FileReader();

    reader.onload = function () {
        let data = new Uint8Array(reader.result);
        let encrypted = new Uint16Array(data.length);

        for (let i = 0; i < data.length; i++) {
            if (data[i] >= n) {
                alert("n слишком маленькое для шифрования");
                return;
            }
            encrypted[i] = modPow(data[i], e, n);
        }

        // сохраняем файл
        let blob = new Blob([encrypted]);
        let url = URL.createObjectURL(blob);

        let a = document.createElement("a");
        a.href = url;
        a.download = "encrypted.bin";
        a.click();

        let reader2 = new FileReader();

        reader2.onload = function () {
            let arr = new Uint16Array(reader2.result);

            document.getElementById("output").innerText =
                Array.from(arr).join(" ");
        };

        reader2.readAsArrayBuffer(blob);
    };

    reader.readAsArrayBuffer(file);
}

function decrypt() {
    let r = +document.getElementById("r").value;
    let d = +document.getElementById("d2").value;
    let file = document.getElementById("fileDec").files[0];

    if (!r || !d || !file) {
        alert("Введите r, d и выберите файл");
        return;
    }

    let reader = new FileReader();

    reader.onload = function () {
        let encrypted = new Uint16Array(reader.result);
        let decrypted = new Uint8Array(encrypted.length);

        for (let i = 0; i < encrypted.length; i++) {
            decrypted[i] = modPow(encrypted[i], d, r);
        }

        let blob = new Blob([decrypted]);
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "decrypted.bin";
        a.click();

        document.getElementById("output").innerText = "Файл расшифрован";
    };

    reader.readAsArrayBuffer(file);

}
