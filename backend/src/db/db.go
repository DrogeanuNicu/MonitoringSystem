package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

// ================================================================================================
//
//	Global Types
//
// ================================================================================================
type DatabaseConfig struct {
	Address  string `json:"Address"`
	Port     int    `json:"Port"`
	User     string `json:"User"`
	Password string `json:"Password"`
	Name     string `json:"Name"`
}

// ================================================================================================
//
//	Local Types
//
// ================================================================================================

// ================================================================================================
//
//	Global Variables
//
// ================================================================================================

// ================================================================================================
//
//	Local Variables
//
// ================================================================================================
var db *sql.DB
var logger = log.New(os.Stdout, "[DB] ", log.Ldate|log.Ltime)

// ================================================================================================
//
//	Global Functions
//
// ================================================================================================
func Init(config *DatabaseConfig) {
	var err error

	conStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		config.Address, config.Port, config.User, config.Password, config.Name)

	db, err = sql.Open("postgres", conStr)
	if err != nil {
		panic(err)
	}

	err = db.Ping()
	if err != nil {
		panic(err)
	}

	if !checkTable("users") {
		createUsersTable()
	}

	if !checkTable("boards") {
		createBoardsTable()
	}

	logger.Println("Database is ready!")
}

func DeInit() error {
	err := db.Close()

	if err != nil {
		return err
	}

	return nil
}

// ================================================================================================
//
//	Local Functions
//
// ================================================================================================
func checkTable(table string) bool {
	tableExists := false
	command := fmt.Sprintf("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '%s')", table)

	err := db.QueryRow(command).Scan(&tableExists)
	if err != nil {
		panic(fmt.Sprintf("Error checking if '%s' table exists:\n%s\n", table, err))
	}

	return tableExists
}

func createUsersTable() {
	_, err := db.Exec("CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE, email VARCHAR(50) UNIQUE, password VARCHAR(150))")
	if err != nil {
		panic(fmt.Sprintf("Error creating 'users' table: %s\n", err))
	}
	logger.Println("Created 'users' table")
}

func createBoardsTable() {
	_, err := db.Exec("CREATE TABLE boards (id SERIAL PRIMARY KEY, name VARCHAR(20), user_id INTEGER REFERENCES users(id) ON DELETE CASCADE)")
	if err != nil {
		panic(fmt.Sprintf("Error creating 'boards' table: %s\n", err))
	}
	logger.Println("Created 'boards' table")
}
