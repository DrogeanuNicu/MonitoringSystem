/**************************************************************************************************
 *                                        Include Files                                           *
 *************************************************************************************************/
#include "Gps.hpp"
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

/**************************************************************************************************
 *                                      Global Variables                                         *
 *************************************************************************************************/
Gps_DataType Gps_Data;
extern TinyGsm modem;

/**************************************************************************************************
 *                                Static Function Prototypes                                     *
 *************************************************************************************************/

/**************************************************************************************************
 *                             Static Function Definitions                                       *
 *************************************************************************************************/

/**************************************************************************************************
 *                              Global Function Definitions                                      *
 *************************************************************************************************/
void Gps_Init(void)
{
    LOG("Enabling GPS/GNSS/GLONASS\n");
    while (!modem.enableGPS(MODEM_GPS_ENABLE_GPIO))
        ;
    LOG("GPS Enabled\n");
}

void Gps_Main(void)
{
    if (false == modem.isEnableGPS())
    {
        Gps_Init();
    }

    if (true == Gps_GetData(&Gps_Data))
    {
#if defined(DEBUG_SERIAL_LOG)
        // Gps_PrintData(&Gps_Data);
#endif
    }
}

void Gps_PrintData(Gps_DataType *pData)
{
#if defined(DEBUG_SERIAL_LOG)
    /* Delays required for print */
    Logger_TakeSemaphore();
    LOG_UNSAFE("Requesting current GPS/GNSS/GLONASS location\n");
    LOG_UNSAFE("FixMode: %u\n", pData->fixedMode);
    LOG_UNSAFE("Lat: %.6f\tLon: %.6f\tAlt: %.6f\n", pData->lat, pData->lon, pData->alt);
    vTaskDelay(pdMS_TO_TICKS(10));
    LOG_UNSAFE("Speed: %.6f\n", pData->speed);
    LOG_UNSAFE("V Sat: %d\tU Sat: %d\tAcc: %f\n", pData->visSat, pData->usedSat, pData->accuracy);
    vTaskDelay(pdMS_TO_TICKS(10));
    LOG_UNSAFE("Year: %d\tMon: %d\tDay: %d\n", pData->year, pData->month, pData->day);
    LOG_UNSAFE("Hour: %d\tMin: %d\tSec: %d\n\n", pData->hour, pData->min, pData->sec);
    vTaskDelay(pdMS_TO_TICKS(10));
    Logger_GiveSemaphore();
#endif
}

bool Gps_GetData(Gps_DataType *pData)
{
    bool ReturnStatus = false;

    ReturnStatus = modem.getGPS(
        &(pData->fixedMode),
        &(pData->lat),
        &(pData->lon),
        &(pData->speed),
        &(pData->alt),
        &(pData->visSat),
        &(pData->usedSat),
        &(pData->accuracy),
        &(pData->year),
        &(pData->month),
        &(pData->day),
        &(pData->hour),
        &(pData->min),
        &(pData->sec));

    return ReturnStatus;
}