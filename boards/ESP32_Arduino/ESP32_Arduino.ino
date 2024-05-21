/**************************************************************************************************
 *                                        Include Files                                           *
 *************************************************************************************************/
#include "Config.h"
#include <TinyGsmClient.h>
#ifdef DEBUG_DUMP_AT_COMMANDS
#include <StreamDebugger.h>
#endif
#include "esp_task_wdt.h"

#include "Certs.h"
#include "Logger.h"
#include "Gps.h"
#include "Gsm.h"
#include "Mqtts.h"
#include "Spi.h"
#include "Can.h"

/**************************************************************************************************
 *                                          Macros                                               *
 *************************************************************************************************/
#define MODEM_CORE 0
#if CONFIG_FREERTOS_UNICORE
#define VEHICLE_CORE 0
#else
#define VEHICLE_CORE 1
#endif

/**************************************************************************************************
 *                                        Constants                                              *
 *************************************************************************************************/

/**************************************************************************************************
 *                                      Static Variables                                         *
 *************************************************************************************************/

/**************************************************************************************************
 *                                      Global Variables                                         *
 *************************************************************************************************/
#ifdef DEBUG_DUMP_AT_COMMANDS
StreamDebugger debugger(SerialAT, Serial);
TinyGsm modem(debugger);
#else
TinyGsm modem(SerialAT);
#endif

volatile bool ShallSendMqttsData = true;

/**************************************************************************************************
 *                                Static Function Prototypes                                     *
 *************************************************************************************************/

/**************************************************************************************************
 *                             Static Function Definitions                                       *
 *************************************************************************************************/

/**************************************************************************************************
 *                              Global Function Definitions                                      *
 *************************************************************************************************/
void setup()
{
    disableCore0WDT();
    disableCore1WDT();
    esp_task_wdt_deinit();
    // esp_task_wdt_init(20, true);
    Logger_Init(MODEM_BAUDRATE);

    LOG("Vehicle core: %u\tModem Core: %u\n", VEHICLE_CORE, MODEM_CORE);

    xTaskCreatePinnedToCore(
        Task_Gateway,
        "Gateway",
        8192,
        NULL,
        0xFF,
        NULL,
        MODEM_CORE);

    xTaskCreatePinnedToCore(
        Task_Collect,
        "Collect",
        8192,
        NULL,
        0xFF,
        NULL,
        VEHICLE_CORE);
}

void loop()
{
}

void Task_Gateway(void *parameter)
{
    SerialAT.begin(MODEM_BAUDRATE, SERIAL_8N1, MODEM_RX_PIN, MODEM_TX_PIN);
    GsmModem_Init();
    GsmModem_Connect();
    // esp_task_wdt_reset();
    
    Mqtts_Init();
    Mqtts_Connect();
    // esp_task_wdt_reset();
    
    Gps_Init();
    // esp_task_wdt_reset();
    for (;;)
    {

#if defined(DEBUG_DUMP_AT_COMMANDS)
        while (SerialAT.available())
        {
            Logger_TakeSemaphore();
            LOG_UNSAFE("%c", SerialAT.read());
            Logger_GiveSemaphore();
        }
        if (Serial.available())
        {
            SerialAT.write(Serial.read());
        }
#endif

        Gps_Main();
        Mqtts_Main(ShallSendMqttsData);

        vTaskDelay(pdMS_TO_TICKS(100));
    }
}

void Task_Collect(void *parameter)
{
    Spi_Init();
    Can_Init(CAN_NOMIMAL_BITRATE);

    for (;;)
    {
        Can_Main();

        vTaskDelay(pdMS_TO_TICKS(100));
    }
}
