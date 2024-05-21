/**************************************************************************************************
 *                                        Include Files                                           *
 *************************************************************************************************/
#include "Logger.h"

/**************************************************************************************************
 *                                          Macros                                               *
 *************************************************************************************************/

/**************************************************************************************************
 *                                        Constants                                              *
 *************************************************************************************************/

/**************************************************************************************************
 *                                      Static Variables                                         *
 *************************************************************************************************/
#ifdef DEBUG_SERIAL_LOG
static char Buffer[PRINT_BUFFER_SIZE];
#endif

/**************************************************************************************************
 *                                      Global Variables                                         *
 *************************************************************************************************/
#ifdef DEBUG_SERIAL_LOG
SemaphoreHandle_t Logger_Semaphore;
#endif

/**************************************************************************************************
 *                                Static Function Prototypes                                     *
 *************************************************************************************************/

/**************************************************************************************************
 *                             Static Function Definitions                                       *
 *************************************************************************************************/

/**************************************************************************************************
 *                              Global Function Definitions                                      *
 *************************************************************************************************/
void Logger_Init(uint32_t BaudRate)
{
    Serial.begin(BaudRate);
#ifdef DEBUG_SERIAL_LOG
    Logger_Semaphore = xSemaphoreCreateMutex();
#endif
}

#ifdef DEBUG_SERIAL_LOG
void Logger_Log(const char *Format, ...)
{
    if (xSemaphoreTake(Logger_Semaphore, portMAX_DELAY) == pdTRUE)
    {
        va_list args;
        va_start(args, Format);
        vsnprintf(Buffer, sizeof(Buffer), Format, args);
        va_end(args);

        Serial.print(Buffer);
        xSemaphoreGive(Logger_Semaphore);
    }
}

void Logger_LogUnsafe(const char *Format, ...)
{
    va_list args;
    va_start(args, Format);
    vsnprintf(Buffer, sizeof(Buffer), Format, args);
    va_end(args);

    Serial.print(Buffer);
}
bool Logger_TakeSemaphore(void)
{
    return xSemaphoreTake(Logger_Semaphore, portMAX_DELAY);
}
void Logger_GiveSemaphore(void)
{
    xSemaphoreGive(Logger_Semaphore);
}

#endif