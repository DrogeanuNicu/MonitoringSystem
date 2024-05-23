/**************************************************************************************************
 *                                        Include Files                                           *
 *************************************************************************************************/
#include "Gsm.hpp"
#include "Logger.hpp"
#include <TinyGsmClient.h>

/**************************************************************************************************
 *                                          Macros                                               *
 *************************************************************************************************/

/**************************************************************************************************
 *                                        Constants                                              *
 *************************************************************************************************/

/**************************************************************************************************
 *                                      Static Variables                                         *
 *************************************************************************************************/
static const char ResetPin = MODEM_RESET_PIN;

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

/**************************************************************************************************
 *                             Static Function Definitions                                       *
 *************************************************************************************************/
static void UpdateData(void)
{
    Gsm_Data.signalQuality = modem.getSignalQuality();
    GetTimestamp();
}

static void GetTimestamp(void)
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
    PrintData();
#endif
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
