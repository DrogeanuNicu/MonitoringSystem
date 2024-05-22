/**************************************************************************************************
 *                                        Include Files                                           *
 *************************************************************************************************/
#include "Can.h"
#include "Logger.h"
#include <ACAN2515.h>

/**************************************************************************************************
 *                                          Macros                                               *
 *************************************************************************************************/

/**************************************************************************************************
 *                                        Constants                                              *
 *************************************************************************************************/
static const byte MCP2515_CS = 13;
static const byte MCP2515_INT = 4;
static const uint32_t QUARTZ_FREQUENCY = 16UL * 1000UL * 1000UL;

/**************************************************************************************************
 *                                      Static Variables                                         *
 *************************************************************************************************/
static ACAN2515 Mcp2515(MCP2515_CS, SPI, MCP2515_INT);

/**************************************************************************************************
 *                                      Global Variables                                         *
 *************************************************************************************************/
Can_PType_0x601 Can_P_0x601;
Can_PType_0x602 Can_P_0x602;
Can_PType_0x501 Can_P_0x501;
Can_PType_0x502 Can_P_0x502;
Can_PType_0x503 Can_P_0x503;
Can_PType_0x1806E5F4 Can_P_0x1806E5F4;
Can_PType_0x18FF50E5 Can_P_0x18FF50E5;

/**************************************************************************************************
 *                                Static Function Prototypes                                     *
 *************************************************************************************************/
#ifdef DEBUG_SERIAL_LOG
static void PrintFrame(CANMessage *pFrame);
#endif
static void UpdateData(CANMessage *pFrame);

/**************************************************************************************************
 *                             Static Function Definitions                                       *
 *************************************************************************************************/
#ifdef DEBUG_SERIAL_LOG
static void PrintFrame(CANMessage *pFrame)
{
    Logger_TakeSemaphore();

    LOG_UNSAFE("Received packet with id: %x\n", pFrame->id);
    for (int i = 0; i < pFrame->len; i++)
    {
        LOG_UNSAFE("%u, ", pFrame->data[i]);
    }
    LOG_UNSAFE("\n\n");

    Logger_GiveSemaphore();
}
#endif

static void UpdateData(CANMessage *pFrame)
{
    switch (pFrame->id)
    {
    case 0x601:
        Can_P_0x601.motorSpeed = (pFrame->data[0] << 8) + pFrame->data[1];
        Can_P_0x601.motorTemperature = pFrame->data[2];
        Can_P_0x601.controllerTemperature = pFrame->data[3];
        Can_P_0x601.motorCurrent = ((pFrame->data[4] << 8) + pFrame->data[5]) / 10.0;
        Can_P_0x601.batteryVoltage = ((pFrame->data[6] << 8) + pFrame->data[7]) / 10.0;
        break;

    case 0x602:
        Can_P_0x602.motorVoltageFrequency = (pFrame->data[0] << 8) + pFrame->data[1];
        Can_P_0x602.diagnosticTroubleCodes = (pFrame->data[2] << 8) + pFrame->data[3];
        Can_P_0x602.throttleLevel = pFrame->data[4];
        Can_P_0x602.brakingLevel = pFrame->data[5];
        Can_P_0x602.controllerStatusFlags = pFrame->data[6];
        break;

    case 0x501:
        Can_P_0x501.lowestCellVoltage = ((pFrame->data[0] << 8) + pFrame->data[1]) / 10000.0;
        Can_P_0x501.highestCellVoltage = ((pFrame->data[2] << 8) + pFrame->data[3]) / 10000.0;
        Can_P_0x501.lowestCellTemperature = pFrame->data[4];
        Can_P_0x501.highestCellTemperature = pFrame->data[5];
        Can_P_0x501.internalBmsTemperature = pFrame->data[6];
        Can_P_0x501.bmsStatusFlags = pFrame->data[7];
        break;

    case 0x502:
        Can_P_0x502.batteryPackVoltage = ((pFrame->data[0] << 8) + pFrame->data[1]) / 10.0;
        Can_P_0x502.batteyPackCurrent = ((pFrame->data[2] << 8) + pFrame->data[3]) / 10.0 - 20.0;
        Can_P_0x502.batteryPackStateOfCharge = pFrame->data[4] / 2.0;
        Can_P_0x502.batteryPackCapacity = pFrame->data[5];
        Can_P_0x502.batteryPackDod = pFrame->data[6];
        Can_P_0x502.batteryPackStateOfHealth = pFrame->data[7] / 10.0;
        break;

    case 0x503:
        Can_P_0x503.batteryVoltage12V = ((pFrame->data[0] << 8) + pFrame->data[1]) / 10.0;
        Can_P_0x503.lowestCellVoltageId = pFrame->data[2];
        Can_P_0x503.highestCellVoltageId = pFrame->data[3];
        Can_P_0x503.lowestCellTemperatureId = pFrame->data[4];
        Can_P_0x503.highestCellTemperatureId = pFrame->data[5];
        break;

    case 0x1806E5F4:
        Can_P_0x1806E5F4.maxChargingVoltage = ((pFrame->data[0] << 8) + pFrame->data[1]) / 10.0;
        Can_P_0x1806E5F4.maxChargingCurrent = ((pFrame->data[2] << 8) + pFrame->data[3]) / 10.0;
        Can_P_0x1806E5F4.chargingControl = pFrame->data[4];
        Can_P_0x1806E5F4.operatingMode = pFrame->data[5];

    case 0x18FF50E5:
        Can_P_0x18FF50E5.outputChargingVoltage = ((pFrame->data[0] << 8) + pFrame->data[1]) / 10.0;
        Can_P_0x18FF50E5.outputChargingCurrent = ((pFrame->data[2] << 8) + pFrame->data[3]) / 10.0;
        Can_P_0x18FF50E5.chargerStatusFlags = pFrame->data[4];
        Can_P_0x18FF50E5.chargerTemperature = pFrame->data[5];

    default:
        break;
    }
}

/**************************************************************************************************
 *                              Global Function Definitions                                      *
 *************************************************************************************************/
void Can_Init(uint32_t BitRateKbps)
{
    ACAN2515Settings settings(QUARTZ_FREQUENCY, BitRateKbps * 1000UL); /* 500 KBPS*/
    settings.mRequestedMode = ACAN2515Settings::NormalMode;
    uint16_t errorCode;

    do
    {
        errorCode = Mcp2515.begin(settings, []
                                  { Mcp2515.isr(); });

        if (errorCode == 0)
        {
#if defined(DEBUG_SERIAL_LOG)
            Logger_TakeSemaphore();
            LOG_UNSAFE("Bit Rate prescaler: %u\n", settings.mBitRatePrescaler);
            LOG_UNSAFE("Propagation Segment: %u\n", settings.mPropagationSegment);
            LOG_UNSAFE("Phase segment 1: %u\n", settings.mPhaseSegment1);
            LOG_UNSAFE("Phase segment 2: %u\n", settings.mPhaseSegment2);
            LOG_UNSAFE("SJW: %u\n", settings.mSJW);
            LOG_UNSAFE("Triple Sampling: %s\n", settings.mTripleSampling ? "yes" : "no");
            LOG_UNSAFE("Actual bit rate: %u bit/s\n", settings.actualBitRate());
            LOG_UNSAFE("Exact bit rate? %s\n", settings.exactBitRate() ? "yes" : "no");
            LOG_UNSAFE("Sample point: %u%\n", settings.samplePointFromBitStart());
            Logger_GiveSemaphore();
#endif
        }
        else
        {
            LOG("MCP2515 configuration error %x\n", errorCode);
        }
        vTaskDelay(pdMS_TO_TICKS(100));
    } while (errorCode != 0U);
}

void Can_Main(void)
{
    CANMessage frame;
    if (Mcp2515.available())
    {
        xSemaphoreGive(Mcp2515.mISRSemaphore);
        Mcp2515.receive(frame);
#ifdef DEBUG_SERIAL_LOG
        PrintFrame(&frame);
#endif
        UpdateData(&frame);
    }
}
