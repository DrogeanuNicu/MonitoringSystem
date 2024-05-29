package dashboard

import (
	"bufio"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

// ================================================================================================
//
//	Global Types
//
// ================================================================================================

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
const folderPermissions fs.FileMode = 0755

// ================================================================================================
//
//	Global Functions
//
// ================================================================================================
func FsAddUser(username string) error {
	usernameFolderPath := filepath.Join(config.DataPath, username)

	if _, err := os.Stat(usernameFolderPath); err == nil {
		if err := os.RemoveAll(usernameFolderPath); err != nil {
			logger.Printf("Failed to remove existing user folder for %s: %v\n", username, err)
			return err
		}
	} else if !os.IsNotExist(err) {
		logger.Printf("Failed to check if user folder exists for %s: %v\n", username, err)
		return err
	}

	if err := os.Mkdir(usernameFolderPath, folderPermissions); err != nil {
		logger.Printf("Failed to create user folder for %s: %v\n", username, err)
		return err
	}

	return nil
}

func FsAddBoard(username string, boardConf BoardConfig) error {
	boardFolderPath := filepath.Join(config.DataPath, username, boardConf.Board)

	if _, err := os.Stat(boardFolderPath); err == nil {
		if err := os.RemoveAll(boardFolderPath); err != nil {
			logger.Printf("Failed to remove existing board folder for %s/%s: %v\n", username, boardConf.Board, err)
			return err
		}
	} else if !os.IsNotExist(err) {
		logger.Printf("Failed to check if board folder exists for %s/%s: %v\n", username, boardConf.Board, err)
		return err
	}

	if err := os.Mkdir(boardFolderPath, folderPermissions); err != nil {
		logger.Printf("Failed to create board folder for %s/%s: %v\n", username, boardConf.Board, err)
		return err
	}

	err := fsCreateCsvDataFile(&username, &boardConf)
	if err != nil {
		return err
	}

	err = fsCreateConfigFile(&username, &boardConf)
	if err != nil {
		return err
	}

	return nil
}

func FsDeleteBoard(username string, board string) error {
	boardFolderPath := filepath.Join(config.DataPath, username, board)

	if _, err := os.Stat(boardFolderPath); err == nil {
		if err := os.RemoveAll(boardFolderPath); err != nil {
			logger.Printf("Failed to remove existing board folder for %s/%s: %v\n", username, board, err)
			return err
		}
	} else if !os.IsNotExist(err) {
		logger.Printf("Failed to check if board folder exists for %s/%s: %v\n", username, board, err)
		return err
	}

	if _, err := os.Stat(boardFolderPath); err == nil {
		logger.Printf("Board folder for %s/%s was not deleted\n", username, board)
		return err
	}

	return nil
}

func FsEditBoardData(username string, data BoardConfig, oldBoard string, deleteStoredData bool) error {
	oldFilePath := getCsvFilepath(&username, &oldBoard)

	if data.Board != oldBoard || deleteStoredData {
		_, err := os.Stat(oldFilePath)
		if !os.IsNotExist(err) {
			err = FsDeleteBoard(username, oldBoard)
			if err != nil {
				return err
			}
		}

		err = FsAddBoard(username, data)
		if err != nil {
			return err
		}

		return nil
	}

	if !deleteStoredData {
		err := fsDeleteConfigFile(&username, &(data.Board))
		if err != nil {
			return err
		}

		err = fsCreateConfigFile(&username, &data)
		if err != nil {
			return err
		}
	}

	return nil
}

func FsDownloadBoardData(username string, board string) (string, error) {
	filePath := getCsvFilepath(&username, &board)

	_, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		logger.Printf("The file '%s' was not found\n", filePath)
		return "", err
	}

	return filePath, nil
}

func FsDownloadOtaUpdate(username string, board string) (string, error) {
	filePath := GetOtaBinPath(&username, &board)

	_, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		logger.Printf("The file '%s' was not found\n", filePath)
		return "", err
	}

	return filePath, nil
}

func FsReadBoardConfig(username string, board string, boardConf *BoardConfig) error {
	filePath := getJsonFilepath(&username, &board)

	file, err := os.Open(filePath)
	if err != nil {
		logger.Println("Error opening file:", err)
		return err
	}
	defer file.Close()

	jsonData, err := io.ReadAll(file)
	if err != nil {
		logger.Println("Error reading file:", err)
		return err
	}

	err = json.Unmarshal(jsonData, boardConf)
	if err != nil {
		logger.Println("Error unmarshaling JSON:", err)
		return err
	}

	return nil
}

func GetOtaBinPath(username *string, board *string) string {
	return filepath.Join(config.DataPath, *username, *board, "update.bin")
}

// ================================================================================================
//
//	Local Functions
//
// ================================================================================================
func getCsvFilepath(username *string, board *string) string {
	return filepath.Join(config.DataPath, *username, *board, *board+".csv")
}

func getJsonFilepath(username *string, board *string) string {
	return filepath.Join(config.DataPath, *username, *board, *board+".json")
}

func fsAppendBoardData(username *string, board *string, newData *[]string) error {
	filePath := getCsvFilepath(username, board)
	file, err := os.OpenFile(filePath, os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		logger.Printf("Could not open the csv file for: %s/%s. %v", *username, *board, err)
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	err = writer.Write(*newData)
	if err != nil {
		return err
	}

	return nil
}

func fsReadLastBoardData(username *string, board *string, data *[][]string, maxElemsPerChart uint64) error {
	filePath := getCsvFilepath(username, board)

	file, err := os.Open(filePath)
	if err != nil {
		logger.Printf("Could not open the csv file: %s. %v\n", filePath, err)
		return err
	}
	defer file.Close()

	var actualLen uint64 = 0
	if maxElemsPerChart != 0 {
		actualLen = maxElemsPerChart
	} else {
		actualLen = config.DefaultChartsDataLength
	}

	var lineCount uint64 = 0
	ringBuffer := make([]string, actualLen)

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		ringBuffer[lineCount%uint64(len(ringBuffer))] = line
		lineCount++
	}

	if err := scanner.Err(); err != nil {
		logger.Println(err)
		return err
	}

	if lineCount == 1 {
		return nil
	}

	startIndex := lineCount % actualLen
	if lineCount < actualLen {
		startIndex = 1
		lineCount -= 1
	}

	if lineCount > actualLen {
		lineCount = actualLen
	}

	*data = [][]string{}
	for i := uint64(0); i < lineCount; i++ {
		*data = append(*data, strings.Split(ringBuffer[(startIndex+i)%uint64(len(ringBuffer))], ","))
	}

	return nil
}

func fsCreateConfigFile(username *string, boardConf *BoardConfig) error {
	/* TODO: Remove this after you have updated the database to contain the board config as well*/
	filePath := getJsonFilepath(username, &(boardConf.Board))
	jsonFile, err := os.Create(filePath)
	if err != nil {
		logger.Printf("Failed to create JSON file for %s/%s: %v\n", *username, boardConf.Board, err)
		return err
	}
	defer jsonFile.Close()

	jsonData, err := json.Marshal(*boardConf)
	if err != nil {
		logger.Println("Error marshaling JSON:", err)
		return err
	}

	_, err = jsonFile.Write(jsonData)
	if err != nil {
		logger.Println("Error writing JSON to file:", err)
		return err
	}

	return nil
}

func fsDeleteConfigFile(username *string, board *string) error {
	filePath := getJsonFilepath(username, board)

	err := os.Remove(filePath)
	if err != nil {
		logger.Printf("Error deleting the config file `%s`, %v", filePath, err)
		return err
	}

	return nil
}

func fsCreateCsvDataFile(username *string, boardConf *BoardConfig) error {
	filePath := getCsvFilepath(username, &(boardConf.Board))
	if _, err := os.Stat(filePath); err != nil {
		if !os.IsNotExist(err) {
			logger.Printf("Failed to check if CSV file exists for %s/%s: %v\n", *username, boardConf.Board, err)
			return err
		}

		file, err := os.Create(filePath)
		if err != nil {
			logger.Printf("Failed to create CSV file for %s/%s: %v\n", *username, boardConf.Board, err)
			return err
		}
		defer file.Close()

		writer := csv.NewWriter(file)
		defer writer.Flush()

		headers := make([]string, len(boardConf.Parameters))
		for i, param := range boardConf.Parameters {
			if param.Uom != "" {
				headers[i] = fmt.Sprintf("%s [%s]", param.Name, param.Uom)
			} else {
				headers[i] = param.Name
			}
		}
		if err := writer.Write(headers); err != nil {
			logger.Printf("Failed to write CSV headers for %s/%s: %v\n", *username, boardConf.Board, err)
			return err
		}
		headers = nil
	}

	return nil
}
