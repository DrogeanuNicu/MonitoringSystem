#pragma once

/* Debug Config */
// #define DEBUG_DUMP_AT_COMMANDS
#define DEBUG_SERIAL_LOG
// #define TINY_GSM_DEBUG Serial

/* */
#define SERVER_ADDR "drogeanunicusor.go.ro"
#define USERNAME "nicu"
#define BOARD "esp32"

/* Board Config */
#define LILYGO_T_A7670
#define BOARD_PWRKEY_PIN (4U) /* The modem boot pin needs to follow the startup sequence */
#define BOARD_ADC_PIN (35U)   /* The modem power pin */
#define BOARD_POWERON_PIN (12U)
#define BOARD_MISO_PIN (2U)
#define BOARD_MOSI_PIN (15U)
#define BOARD_SCK_PIN (14U)
#define BOARD_CS_PIN (13U)
#define BOARD_BAT_ADC_PIN (35U)

/* Modem config */
#define MODEM_BAUDRATE (115200U)
#define MODEM_DTR_PIN (25U)
#define MODEM_TX_PIN (26U)
#define MODEM_RX_PIN (27U)
#define MODEM_RING_PIN (33U)
#define MODEM_RESET_PIN (5U)
#define MODEM_RESET_LEVEL HIGH
#define MODEM_GPS_ENABLE_GPIO (-1)
#define MODEM_NETWORK_MAX_TIMEOUT_MS (120000U)
#define SerialAT Serial1

/* Tiny GSM config */
#define TINY_GSM_RX_BUFFER (1024U) /* Set RX buffer to 1Kb */
#ifndef TINY_GSM_MODEM_A7670
#define TINY_GSM_MODEM_A7670
#endif

/* CAN config */
#define CAN_NOMIMAL_BITRATE (250UL)

/* MTTS config */
#define MQTTS_BROKER (SERVER_ADDR)
#define MQTTS_PORT (8883U)
#define MQTTS_CLIENT_ID_STRING BOARD
#define MQTTS_SUBSCRIBE_TOPIC (USERNAME "/" BOARD "/ota")
#define MQTTS_PUBLIS_TOPIC (USERNAME "/" BOARD)
#define MQTTS_CLIENT_ID (0U)
#define MQTTS_MAX_MSG_LEN (1024U)
#define MQTTS_SUB_QOS_LEVEL (2U)
#define MQTTS_KEEP_ALIVE_S (60U)

/* HTTPS config*/
#define HTTPS_SSL_CTX (8U) /* Needs to be different from 0, hardcoded value for MQTTS*/

/* OTA config */
#define OTA_SERVER_URL ("https://" SERVER_ADDR "/api/" USERNAME "/download/update/binary/" BOARD)
#define OTA_VALIDATION_TOKEN_MAX_LEN (256U)
#define OTA_MAX_CHUNK_SIZE TINY_GSM_RX_BUFFER
