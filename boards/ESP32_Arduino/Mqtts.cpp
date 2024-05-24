/**************************************************************************************************
 *                                        Include Files                                           *
 *************************************************************************************************/
#include "Config.hpp"
#include "Mqtts.hpp"
#include <TinyGsmClient.h>
#include "Certs.hpp"
#include "Logger.hpp"
#include "Gps.hpp"
#include "Can.hpp"
#include "Gsm.hpp"

/**************************************************************************************************
 *                                          Macros                                               *
 *************************************************************************************************/

/**************************************************************************************************
 *                                        Constants                                              *
 *************************************************************************************************/
const char *Mqtts_Broker = MQTTS_BROKER;
const uint16_t Mqtts_Port = MQTTS_PORT;
const char *Mqtts_ClientIdStr = MQTTS_CLIENT_ID_STRING;
const char *Mqtts_SubscribeTopic = MQTTS_SUBSCRIBE_TOPIC;
const char *Mqtts_PublishTopic = MQTTS_PUBLIS_TOPIC;
const uint8_t Mqtts_ClientId = MQTTS_CLIENT_ID;

/**************************************************************************************************
 *                                      Static Variables                                         *
 *************************************************************************************************/
static char MsgBuffer[MQTTS_MAX_MSG_LEN];
static int16_t lastMqttsSendSecond = 0;

/**************************************************************************************************
 *                                      Global Variables                                         *
 *************************************************************************************************/
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
void Mqtts_Init()
{
    LOG("Starting MQTTS communication\n");
    while (!modem.mqtt_begin(true))
        ;
    LOG("Started MQTTS communication\n");
}

void Mqtts_Main(void)
{
    if (!modem.mqtt_connected(Mqtts_ClientId))
    {
        if (false == Mqtts_Connect())
        {
            esp_restart();
        }
    }

    if (lastMqttsSendSecond != Gsm_Data.sec)
    {
        lastMqttsSendSecond = Gsm_Data.sec;
        Mqtts_Send();
    }

    modem.mqtt_handle();
}

bool Mqtts_Connect()
{
    modem.mqtt_set_certificate(Mqtts_CertsCa, Mqtts_CertsServer, Mqtts_CertsKey);
    LOG("Connecting to MQTT broker: %s\n", Mqtts_Broker);

    modem.mqtt_connect(Mqtts_ClientId, Mqtts_Broker, Mqtts_Port, Mqtts_ClientIdStr);
    if (!modem.mqtt_connected())
    {
        LOG("MQTT could not connect to the broker!\n");
        return false;
    }
    LOG("MQTT has connected!\n");

    modem.mqtt_set_callback(Mqtts_Callback);
    /* Make this blocking to ensure that it will always subscribe */
    if (!modem.mqtt_subscribe(Mqtts_ClientId, Mqtts_SubscribeTopic))
    {
        LOG("Could not subscribe to the MQTT topic: %s\n", Mqtts_SubscribeTopic);
        return false;
    }

    return true;
}

bool Mqtts_Send(void)
{
    snprintf(
        MsgBuffer,
        MQTTS_MAX_MSG_LEN,
        "%02d/%02d/%02d %02d:%02d:%02d,%d,%d,"
        "%.6f,%.6f,%.6f,%.2f,%d,%d,%u,"
        "%d,%d,%d,%.2f,%.2f,"
        "%d,%d,%d,%d,%d,"
        "%.2f,%.2f,%d,%d,%d,%d,"
        "%.2f,%.2f,%.2f,%d,%d,%.2f,"
        "%.2f,%d,%d,%d,%d,"
        "%.2f,%.2f,%d,%d,"
        "%.2f,%.2f,%d,%d\0",
        Gsm_Data.day, Gsm_Data.month, Gsm_Data.year, Gsm_Data.hour, Gsm_Data.min, Gsm_Data.sec, Gsm_Data.signalQuality, Gsm_Data.timezoneQuarter,
        Gps_Data.lat, Gps_Data.lon, Gps_Data.alt, Gps_Data.speed, Gps_Data.visSat, Gps_Data.usedSat, Gps_Data.fixedMode,
        Can_P_0x601.motorSpeed, Can_P_0x601.motorTemperature, Can_P_0x601.controllerTemperature, Can_P_0x601.motorCurrent, Can_P_0x601.batteryVoltage,
        Can_P_0x602.motorVoltageFrequency, Can_P_0x602.diagnosticTroubleCodes, Can_P_0x602.throttleLevel, Can_P_0x602.brakingLevel, Can_P_0x602.controllerStatusFlags,
        Can_P_0x501.lowestCellVoltage, Can_P_0x501.highestCellVoltage, Can_P_0x501.lowestCellTemperature, Can_P_0x501.highestCellTemperature, Can_P_0x501.internalBmsTemperature, Can_P_0x501.bmsStatusFlags,
        Can_P_0x502.batteryPackVoltage, Can_P_0x502.batteyPackCurrent, Can_P_0x502.batteryPackStateOfCharge, Can_P_0x502.batteryPackCapacity, Can_P_0x502.batteryPackDod, Can_P_0x502.batteryPackStateOfHealth,
        Can_P_0x503.batteryVoltage12V, Can_P_0x503.lowestCellVoltageId, Can_P_0x503.highestCellVoltageId, Can_P_0x503.lowestCellTemperatureId, Can_P_0x503.highestCellTemperatureId,
        Can_P_0x1806E5F4.maxChargingVoltage, Can_P_0x1806E5F4.maxChargingCurrent, Can_P_0x1806E5F4.chargingControl, Can_P_0x1806E5F4.operatingMode,
        Can_P_0x18FF50E5.outputChargingVoltage, Can_P_0x18FF50E5.outputChargingCurrent, Can_P_0x18FF50E5.chargerStatusFlags, Can_P_0x18FF50E5.chargerTemperature);

    LOG("%.*s\n", MQTTS_MAX_MSG_LEN, MsgBuffer);

    return modem.mqtt_publish(Mqtts_ClientId, Mqtts_PublishTopic, MsgBuffer);
}

void Mqtts_Callback(const char *topic, const uint8_t *payload, uint32_t len)
{
    if (!strcmp(topic, Mqtts_SubscribeTopic))
    {
#if defined(DEBUG_SERIAL_LOG)
        Logger_TakeSemaphore();
        LOG_UNSAFE("\n====== Mqtts Callback ======\n");
        LOG_UNSAFE(topic);
        LOG_UNSAFE("\nPayload: \n");
        for (int i = 0; i < len; ++i)
        {
            LOG_UNSAFE("%u,", payload[i]);
        }
        LOG_UNSAFE("\n============================\n");
        Logger_GiveSemaphore();
#endif

        GsmModem_SaveOtaToken(payload, len);
    }
}
