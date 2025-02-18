package utils

import (
	"testing"
)

// TestEncrypt tests the Encrypt function
func TestEncrypt(t *testing.T) {
	plaintext := "Hello, World!"

	c, err := Encrypt([]byte(plaintext))
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}

	if len(c.Base64Ciphertext) == 0 {
		t.Fatalf("Expected non-empty ciphertext")
	}
}

// TestDecrypt tests the Decrypt function
func TestDecrypt(t *testing.T) {
	plaintext := "Hello, World!"

	c, err := Encrypt([]byte(plaintext))
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}

	decryptedText, err := Decrypt(c)
	if err != nil {
		t.Fatalf("Decrypt failed: %v", err)
	}

	if decryptedText != plaintext {
		t.Fatalf("Expected decrypted text to be %s, got %s", plaintext, decryptedText)
	}
}
