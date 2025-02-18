package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

func CalculateETag(content []byte) string {
	hasher := sha256.New()
	hasher.Write(content)
	hash := hex.EncodeToString(hasher.Sum(nil))
	return fmt.Sprintf("W/\"%s\"", hash)
}
