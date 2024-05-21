/**************************************************************************************************
 *                                        Include Files                                           *
 *************************************************************************************************/
#include "Spi.h"
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

/**************************************************************************************************
 *                                      Global Variables                                         *
 *************************************************************************************************/

/**************************************************************************************************
 *                                Static Function Prototypes                                     *
 *************************************************************************************************/

/**************************************************************************************************
 *                             Static Function Definitions                                       *
 *************************************************************************************************/

/**************************************************************************************************
 *                              Global Function Definitions                                      *
 *************************************************************************************************/
void Spi_Init(void)
{
    SPI.begin(BOARD_SCK_PIN, BOARD_MISO_PIN, BOARD_MOSI_PIN);
    LOG("SPI has started\n");
}