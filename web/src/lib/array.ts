export function hexStringToArrayBuffer(hexString: string): ArrayBuffer {
    // Remove the leading 0x
    hexString = hexString.replace(/^0x/, '');

    // Ensure even number of characters
    if (hexString.length % 2 != 0) {
        console.warn('WARNING: expecting an even number of characters in the hexString');
    }

    // Check for some non-hex characters
    const bad = hexString.match(/[G-Z\s]/i);
    if (bad) {
        console.warn('WARNING: found non-hex characters', bad);
    }

    // Split the string into pairs of octets
    const pairs = hexString.match(/[\dA-F]{2}/gi);
    if (!pairs) {
        throw new Error('Invalid hex string');
    }

    // Convert the octets to integers
    const integers = pairs.map((s) => parseInt(s, 16));

    const array = new Uint8Array(integers);
    console.log(array);

    return array.buffer;
}
