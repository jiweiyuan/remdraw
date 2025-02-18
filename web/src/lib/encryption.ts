import {hexStringToArrayBuffer} from "@/lib/array.ts";

export async function decryptData(iv: Iterable<number>, key: Iterable<number>, ciphertext: Iterable<number>) {
    // Convert arrays to Uint8Array
    const ivArray = new Uint8Array(iv);
    const keyArray = new Uint8Array(key);
    const ciphertextArray = new Uint8Array(ciphertext);

    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyArray,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    // Measure the time taken for decryption
    const start = performance.now();

    try {
        const decryptedArrayBuffer = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: ivArray
            },
            cryptoKey,
            ciphertextArray
        );

        const end = performance.now();
        console.log(`Decryption took ${end - start} milliseconds`);

        // Convert the decrypted data into a readable format
        const decoder = new TextDecoder();
        const decryptedText = decoder.decode(decryptedArrayBuffer);

        console.log('Decrypted text:', decryptedText);
        return decryptedText;
    } catch (e) {
        console.error('Decryption failed:', e);
        return null;
    }
}

export async function encrypt(base64CiperText: string, hexKeyAndIv: string) {
    const keyAndIv = hexKeyAndIv.split(":")
    // change hex to Uint8Array

    const keyBuffer = hexStringToArrayBuffer(keyAndIv[0])
    const ivBuffer = hexStringToArrayBuffer(keyAndIv[1]);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );

    const start = performance.now();

    const encryptedArrayBuffer = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: ivBuffer
        },
        cryptoKey,
        new TextEncoder().encode(base64CiperText)
    );

    const end = performance.now();
    console.log(`Encryption took ${end - start} milliseconds`);

    return encryptedArrayBuffer;
}