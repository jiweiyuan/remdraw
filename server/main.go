package main

import (
	"fmt"
	"log"

	"remdraw.com/server/handler"
)

func main() {

	// set up the handler
	engine := handler.SetupHandler()

	// run the server
	err := engine.Run()
	if err != nil {
		log.Fatal(fmt.Sprintf("Error running engine: %v", err))
		return
	}
}
