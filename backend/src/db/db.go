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
const maxUsernameLen = 30
const maxEmailLen = 30
const maxPasswordLen = 30
const maxBoardNameLen = 20

var db *sql.DB
var logger = log.New(os.Stdout, "[DB   ] ", log.Ldate|log.Ltime)

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

func Login(username string, password string) (bool, error) {
	var found bool
	err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM users WHERE username = $1 AND password = $2)", username, password).Scan(&found)
	if err != nil {
		return false, err
	}

	return found, nil
}

func Register(username string, email string, password string) (string, error) {
	var returnMsg string = ""

	_, err := db.Exec("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", username, email, password)
	if err != nil {
		returnMsg = fmt.Sprintf("The user '%s' already exists!", username)
		return returnMsg, err
	}

	return returnMsg, err
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
	command := fmt.Sprintf("CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(%d) UNIQUE, email VARCHAR(%d) UNIQUE, password VARCHAR(%d))", maxUsernameLen, maxEmailLen, maxPasswordLen)
	_, err := db.Exec(command)
	if err != nil {
		panic(fmt.Sprintf("Error creating 'users' table: %s\n", err))
	}
	logger.Println("Created 'users' table")
}

func createBoardsTable() {
	command := fmt.Sprintf("CREATE TABLE boards (id SERIAL PRIMARY KEY, name VARCHAR(%d), user_id INTEGER REFERENCES users(id) ON DELETE CASCADE)", maxBoardNameLen)
	_, err := db.Exec(command)
	if err != nil {
		panic(fmt.Sprintf("Error creating 'boards' table: %s\n", err))
	}
	logger.Println("Created 'boards' table")
}
