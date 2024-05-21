#pragma once

/**************************************************************************************************
 *                                        Include Files                                           *
 *************************************************************************************************/
#include "Arduino.h"

#include "Config.h"

/**************************************************************************************************
 *                                          Macros                                               *
 *************************************************************************************************/

/**************************************************************************************************
 *                                   Typedefs/Structs/Enums                                      *
 *************************************************************************************************/

/**************************************************************************************************
 *                                        Constants                                              *
 *************************************************************************************************/

/**************************************************************************************************
 *                                      Global Variables                                         *
 *************************************************************************************************/

/**************************************************************************************************
 *                                    Function Prototypes                                        *
 *************************************************************************************************/
void GsmModem_Init(void);
bool GsmModem_Connect(void);
