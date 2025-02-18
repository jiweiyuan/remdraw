package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"io"
	"strings"
)

type CypherEntity struct {
	HexKeyAndIv      string
	Base64Ciphertext string
}

// Encrypt encrypts plaintext using the given key and returns the ciphertext in hex format
func Encrypt(plaintext []byte) (*CypherEntity, error) {

	c := &CypherEntity{}
	// generate a random key
	key := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, key); err != nil {
		return nil, err
	}

	block, err := aes.NewCipher([]byte(key))
	if err != nil {
		return nil, err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	iv := make([]byte, aesGCM.NonceSize())
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return nil, err
	}

	hexKeyAndIv := hex.EncodeToString(key) + ":" + hex.EncodeToString(iv)
	ciphertext := aesGCM.Seal(plaintext[:0], iv, plaintext, nil)
	c.Base64Ciphertext = base64.StdEncoding.EncodeToString(ciphertext)
	c.HexKeyAndIv = hexKeyAndIv
	return c, nil
}

// Decrypt decrypts the ciphertext using the given key and returns the plaintext
func Decrypt(c *CypherEntity) (string, error) {
	keys := strings.Split(c.HexKeyAndIv, ":")

	ciphertext, err := base64.StdEncoding.DecodeString(c.Base64Ciphertext)
	if err != nil {
		return "", err
	}

	key, err := hex.DecodeString(keys[0])
	nonce, err := hex.DecodeString(keys[1])

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	if len(ciphertext) < aesGCM.NonceSize() {
		return "", errors.New("ciphertext too short")
	}

	plaintextBytes, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintextBytes), nil
}
