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
    int motorSpeed = 0;
    int motorTemperature = 0;
    int controllerTemperature = 0;
    float motorCurrent = 0;
    float batteryVoltage = 0;
} Can_PType_0x601;

typedef struct
{
    int motorVoltageFrequency = 0;
    int diagnosticTroubleCodes = 0;
    int throttleLevel = 0;
    int brakingLevel = 0;
    int controllerStatusFlags = 0;
} Can_PType_0x602;

typedef struct
{
    float lowestCellVoltage = 0;
    float highestCellVoltage = 0;
    int lowestCellTemperature = 0;
    int highestCellTemperature = 0;
    int internalBmsTemperature = 0;
    int bmsStatusFlags = 0;
} Can_PType_0x501;

typedef struct
{
    float batteryPackVoltage = 0;
    float batteyPackCurrent = 0;
    float batteryPackStateOfCharge = 0;
    int batteryPackCapacity = 0;
    int batteryPackDod = 0;
    float batteryPackStateOfHealth = 0;
} Can_PType_0x502;

typedef struct
{
    float batteryVoltage12V = 0;
    int lowestCellVoltageId = 0;
    int highestCellVoltageId = 0;
    int lowestCellTemperatureId = 0;
    int highestCellTemperatureId = 0;
} Can_PType_0x503;

typedef struct
{
    float maxChargingVoltage = 0;
    float maxChargingCurrent = 0;
    int chargingControl = 0;
    int operatingMode = 0;
} Can_PType_0x1806E5F4;

typedef struct
{
    float outputChargingVoltage = 0;
    float outputChargingCurrent = 0;
    int chargerStatusFlags = 0;
    int chargerTemperature = 0;
} Can_PType_0x18FF50E5;

/**************************************************************************************************
 *                                        Constants                                              *
 *************************************************************************************************/

/**************************************************************************************************
 *                                      Global Variables                                         *
 *************************************************************************************************/
extern volatile Can_PType_0x601 Can_P_0x601;
extern volatile Can_PType_0x602 Can_P_0x602;
extern volatile Can_PType_0x501 Can_P_0x501;
extern volatile Can_PType_0x502 Can_P_0x502;
extern volatile Can_PType_0x503 Can_P_0x503;
extern volatile Can_PType_0x1806E5F4 Can_P_0x1806E5F4;
extern volatile Can_PType_0x18FF50E5 Can_P_0x18FF50E5;

/**************************************************************************************************
 *                                    Function Prototypes                                        *
 *************************************************************************************************/
void Can_Init(uint32_t BitRateKbps);
void Can_Main(void);
