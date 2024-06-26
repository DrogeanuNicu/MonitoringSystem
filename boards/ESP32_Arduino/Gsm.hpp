#pragma once

/**************************************************************************************************
 *                                        Include Files                                           *
 *************************************************************************************************/
#include "Arduino.h"

#include "Config.hpp"

/**************************************************************************************************
 *                                          Macros                                               *
 *************************************************************************************************/

/**************************************************************************************************
 *                                   Typedefs/Structs/Enums                                      *
 *************************************************************************************************/
typedef struct
{
    int signalQuality;
    int16_t year;
    int16_t month;
    int16_t day;
    int16_t hour;
    int16_t min;
    int16_t sec;
    int16_t timezoneQuarter;
} Gsm_DataType;

/**************************************************************************************************
 *                                        Constants                                              *
 *************************************************************************************************/

/**************************************************************************************************
 *                                      Global Variables                                         *
 *************************************************************************************************/
extern Gsm_DataType Gsm_Data;

/**************************************************************************************************
 *                                    Function Prototypes                                        *
 *************************************************************************************************/
void GsmModem_Init(void);
void GsmModem_Main(void);
bool GsmModem_Connect(void);
void GsmModem_GetTimestamp(void);
void GsmModem_CheckOtaTrigger(void);
void GsmModem_SaveOtaToken(const uint8_t *ValTok, const uint32_t ValTokLen);
void GsmModem_TriggerOtaUpdate(const uint8_t *ValTok, const uint32_t ValTokLen);
