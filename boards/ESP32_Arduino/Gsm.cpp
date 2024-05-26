/**************************************************************************************************
 *                                        Include Files                                           *
 *************************************************************************************************/
#include "Gsm.hpp"
#include "Logger.hpp"
#include <TinyGsmClient.h>
#include <Update.h>

/**************************************************************************************************
 *                                          Macros                                               *
 *************************************************************************************************/
#define HTTPS_AUTH_HEADER_PREFIX_LEN (7U)
#define HTTPS_AUTH_HEADER_MAX_LEN (HTTPS_AUTH_HEADER_PREFIX_LEN + OTA_VALIDATION_TOKEN_MAX_LEN)
#define HTTPS_SUCCES_CODE (200U)

/**************************************************************************************************
 *                                        Constants                                              *
 *************************************************************************************************/

/**************************************************************************************************
 *                                      Static Variables                                         *
 *************************************************************************************************/
static const char ResetPin = MODEM_RESET_PIN;
static const char *OtaServerUrl = OTA_SERVER_URL;
static char AuthHeader[HTTPS_AUTH_HEADER_MAX_LEN];
static volatile bool ShallTriggerOtaUpdate = false;

/**************************************************************************************************
 *                                      Global Variables                                         *
 *************************************************************************************************/
Gsm_DataType Gsm_Data;
extern TinyGsm modem;

/**************************************************************************************************
 *                                Static Function Prototypes                                     *
 *************************************************************************************************/
static void UpdateData(void);
static void GetTimestamp(void);
static void PrintData(void);
static int16_t GetIntBefore(char lastChar);
static bool WriteOtaBinToFlash(void);
static void TriggerOtaUpdate(void);

/**************************************************************************************************
 *                             Static Function Definitions                                       *
 *************************************************************************************************/
static void UpdateData(void)
{
    Gsm_Data.signalQuality = modem.getSignalQuality();
}

static void PrintData(void)
{
    LOG("Signal Quality: %d\nTimestamp: %d %d %d %d %d %d + %d quarter\n",
        Gsm_Data.signalQuality,
        Gsm_Data.day, Gsm_Data.month, Gsm_Data.year,
        Gsm_Data.hour, Gsm_Data.min, Gsm_Data.sec,
        Gsm_Data.timezoneQuarter);
}

static int16_t GetIntBefore(char lastChar)
{
    char buf[7];
    size_t bytesRead = modem.stream.readBytesUntil(
        lastChar, buf, static_cast<size_t>(7));
    // if we read 7 or more bytes, it's an overflow
    if (bytesRead && bytesRead < 7)
    {
        buf[bytesRead] = '\0';
        int16_t res = atoi(buf);
        return res;
    }

    return -9999;
}

static void TriggerOtaUpdate()
{
    uint32_t HttpsCode = 0;
    uint32_t UpdateReady = false;

    if (!modem.https_begin())
    {
        LOG("Failed to start the HTTPS\n");
        goto CLEANUP_OTA_TRIGGER;
    }

    if (!modem.https_set_ssl_index(HTTPS_SSL_CTX))
    {
        LOG("Failed to set the SSL context\n");
        goto CLEANUP_OTA_TRIGGER;
    }

    if (!modem.https_add_header("Authorization", AuthHeader))
    {
        LOG("Failed to add Authorization header\n");
        goto CLEANUP_OTA_TRIGGER;
    }

    if (!modem.https_set_url(OtaServerUrl))
    {
        LOG("Failed to set the server's URL\n");
        goto CLEANUP_OTA_TRIGGER;
    }

    LOG("Get the new OTA binary from the server\n");
    HttpsCode = modem.https_get();
    if (HttpsCode != HTTPS_SUCCES_CODE)
    {
        LOG("HTTPS get failed! Error code = %u\n", HttpsCode);
        goto CLEANUP_OTA_TRIGGER;
    }

    /* The binary is in the modem's memory, write it to the ESP32 flash */
    UpdateReady = WriteOtaBinToFlash();

CLEANUP_OTA_TRIGGER:
    modem.https_end();

    if (true == UpdateReady)
    {
        LOG("Update successfully completed. Rebooting\n");
        esp_restart();
    }
    else
    {
        LOG("Something went wrong. Aborting...\n");
        ShallTriggerOtaUpdate = false;
    }
}

static bool WriteOtaBinToFlash(void)
{
    uint8_t OtaBuffer[OTA_MAX_CHUNK_SIZE];
    uint32_t BinSize = 0;
    uint32_t ChunkLen = 0;
    uint32_t Written = 0;
#ifdef DEBUG_SERIAL_LOG
    uint32_t Total = 0;
    uint32_t Progress = 0;
    uint32_t NewProgress = 0;
#endif

    BinSize = modem.https_get_size();
    LOG("Binary size: %u Kb\n", BinSize);
    if (!Update.begin(BinSize))
    {
        LOG("Not enough space to begin OTA update\n");
        return false;
    }

    LOG("Start the update process...\n");
    while (1)
    {
        ChunkLen = modem.https_body(OtaBuffer, OTA_MAX_CHUNK_SIZE);
        if (0 == ChunkLen)
        {
            break;
        }

        Written = Update.write(OtaBuffer, ChunkLen);
        if (Written != ChunkLen)
        {
            LOG("Written only: %u/%u. Aborting update...\n", Written, ChunkLen);
            break;
        }

#ifdef DEBUG_SERIAL_LOG
        Total += Written;
        NewProgress = (Total * 100) / BinSize;
        if (NewProgress - Progress >= 5 || NewProgress == 100)
        {
            Progress = NewProgress;
            LOG("\r %u%%\n", Progress);
        }
#endif
    }

    if (!Update.end() || !Update.isFinished())
    {
        LOG("Error Occurred. Error #: %u\n", Update.getError());
        return false;
    }

    return true;
}

/**************************************************************************************************
 *                              Global Function Definitions                                      *
 *************************************************************************************************/
void GsmModem_Init(void)
{
#ifdef BOARD_POWERON_PIN
    pinMode(BOARD_POWERON_PIN, OUTPUT);
    digitalWrite(BOARD_POWERON_PIN, HIGH);
#endif

    /* Set modem reset pin, reset modem */
    pinMode(MODEM_RESET_PIN, OUTPUT);
    digitalWrite(MODEM_RESET_PIN, !MODEM_RESET_LEVEL);
    vTaskDelay(pdMS_TO_TICKS(100));
    digitalWrite(MODEM_RESET_PIN, MODEM_RESET_LEVEL);
    vTaskDelay(pdMS_TO_TICKS(2600));
    digitalWrite(MODEM_RESET_PIN, !MODEM_RESET_LEVEL);

    pinMode(BOARD_PWRKEY_PIN, OUTPUT);
    digitalWrite(BOARD_PWRKEY_PIN, LOW);
    vTaskDelay(pdMS_TO_TICKS(100));
    digitalWrite(BOARD_PWRKEY_PIN, HIGH);
    vTaskDelay(pdMS_TO_TICKS(100));
    digitalWrite(BOARD_PWRKEY_PIN, LOW);

    /* Check if the modem is online */
    LOG("\nStart modem...\n");

    int retry = 0;
    while (!modem.testAT(1000))
    {
        if (retry++ > 10)
        {
            digitalWrite(BOARD_PWRKEY_PIN, LOW);
            vTaskDelay(pdMS_TO_TICKS(100));
            digitalWrite(BOARD_PWRKEY_PIN, HIGH);
            vTaskDelay(pdMS_TO_TICKS(1000));
            digitalWrite(BOARD_PWRKEY_PIN, LOW);
            retry = 0;
        }
    }
}

void GsmModem_Main(void)
{
    if (!modem.isNetworkConnected())
    {
        if (!modem.waitForNetwork(MODEM_NETWORK_MAX_TIMEOUT_MS))
        {
            do
            {
                modem.restart(&ResetPin);
            } while (GsmModem_Connect());
        }
    }

    UpdateData();
#ifdef DEBUG_SERIAL_LOG
    // PrintData();
#endif
}

void GsmModem_CheckOtaTrigger(void)
{
    if (ShallTriggerOtaUpdate)
    {
        TriggerOtaUpdate();
    }
}

void GsmModem_GetTimestamp(void)
{
    String ModemResponse;
    // Eg: "14/01/01,02:14:36+08"
    modem.sendAT(GF("+CCLK?"));
    if (modem.waitResponse(GF("+CCLK:")) == 1)
    {
        modem.stream.readStringUntil('"');
        Gsm_Data.year = GetIntBefore('/');
        Gsm_Data.month = GetIntBefore('/');
        Gsm_Data.day = GetIntBefore(',');
        Gsm_Data.hour = GetIntBefore(':');
        Gsm_Data.min = GetIntBefore(':');
        Gsm_Data.sec = GetIntBefore('+');
        Gsm_Data.timezoneQuarter = GetIntBefore('"');

        modem.stream.readStringUntil('\r');
        modem.waitResponse();
    }
}

bool GsmModem_Connect(void)
{
    /* Check if SIM card is online */
    SimStatus sim = SIM_ERROR;
    while (sim != SIM_READY)
    {
        sim = modem.getSimStatus();
        switch (sim)
        {
        case SIM_READY:
            LOG("SIM card online\n");
            break;
        case SIM_LOCKED:
            LOG("The SIM card is locked. Please unlock the SIM card first\n");
            // const char *SIMCARD_PIN_CODE = "123456";
            // modem.simUnlock(SIMCARD_PIN_CODE);
            break;
        default:
            break;
        }
        vTaskDelay(pdMS_TO_TICKS(100));
    }

    /* Check network registration status and network signal status */
    LOG("Wait for the modem to register with the network\n");
    RegStatus status = REG_NO_RESULT;
    while (status == REG_NO_RESULT || status == REG_SEARCHING || status == REG_UNREGISTERED)
    {
        status = modem.getRegistrationStatus();
        switch (status)
        {
        case REG_UNREGISTERED:
        case REG_SEARCHING:
            LOG("Signal Quality:%d\n", modem.getSignalQuality());
            vTaskDelay(pdMS_TO_TICKS(100));
            break;
        case REG_DENIED:
            LOG("Network registration was rejected, please check if the APN is correct\n");
            return false;
        case REG_OK_HOME:
            LOG("Online registration successful\n");
            break;
        case REG_OK_ROAMING:
            LOG("Network registration successful, currently in roaming mode\n");
            break;
        default:
            LOG("Registration Status: %d\n", status);
            vTaskDelay(pdMS_TO_TICKS(100));
            break;
        }
    }

    LOG("\nRegistration Status:%d\n", status);
    String ueInfo;
    if (!modem.getSystemInformation(ueInfo))
    {

        LOG("Could not get the system information!\n");
        return false;
    }

    LOG("Inquiring UE system information: %s\n", ueInfo.c_str());

    if (!modem.enableNetwork())
    {
        LOG("Enable network failed!\n");
        return false;
    }
    LOG("Network IP: %s\n", modem.getLocalIP().c_str());

    return true;
}

void GsmModem_SaveOtaToken(const uint8_t *ValTok, const uint32_t ValTokLen)
{
    if (0 == ValTokLen || ValTokLen > OTA_VALIDATION_TOKEN_MAX_LEN)
    {
        LOG("Validation token is to large\n");
        return;
    }

    snprintf(AuthHeader, HTTPS_AUTH_HEADER_MAX_LEN, "Bearer %.*s", ValTokLen, ValTok);
    ShallTriggerOtaUpdate = true;
}
