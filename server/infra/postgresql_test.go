package infra

import (
	"database/sql"
	"testing"
)

func TestConnection(t *testing.T) {

	c := GetPostgresConfig()
	db := NewDB(c)
	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			t.Errorf("Error closing the connection: %v", err)
		}
	}(db)

	err := db.Ping()
	if err != nil {
		t.Errorf("Error pinging the database: %v", err)
	} else {
		t.Logf("Ping successful")
	}
}
