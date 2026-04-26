const cipherButtonDec = document.querySelector('.inputDec .cipher');
const decipherButtonDec = document.querySelector('.inputDec .decipher');

const outputDec = document.querySelector('#lbOutputDec');

const keyDec = document.querySelector('#numInputDec');
const strDec = document.querySelector('#strInputDec');

outputDec.value = '';

cipherButtonDec.addEventListener('click', () => {
    const key = +keyDec.value;
    const str = strDec.value;
    let cipher = '';

    for (let i = 0; i < str.length; i++) {
        cipher += String.fromCharCode(((str.charCodeAt(i) - 97) * key) % 26 + 97);
    }


    console.log(cipher);

    outputDec.value = cipher;
})

decipherButtonDec.addEventListener('click', () => {

})

const cipherButtonVig = document.querySelector('.inputVig .cipher');
const decipherButtonVig = document.querySelector('.inputVig .decipher');

cipherButtonVig.addEventListener('click', () => {
    console.log(3);
})

decipherButtonVig.addEventListener('click', () => {
    console.log(4);
})
