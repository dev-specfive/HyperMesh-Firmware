# HyperMesh Firmware

Firmware repository for Specfive tracking devices powered by Heltec development boards.

## 📦 Supported Products

<table>
<tr>
<td width="50%" align="center">

### Specfive MiniTrekker

![Specfive MiniTrekker](specfive_mini_trekker.png)

Compact GPS tracking device designed for personal and asset tracking applications.

**Development Board:** Heltec Wireless Stick V3.1

**Firmware:**  
[`firmware_heltec_wireless_v3_1.bin`](firmware_heltec_wireless_v3_1.bin)

</td>
<td width="50%" align="center">

### Specfive Trekker Bravo

![Specfive Trekker Bravo](specfive_trekker_bravo.png)

Advanced GPS tracking device with extended range and enhanced features for professional tracking solutions.

**Development Board:** Heltec Tracker V1.2

**Firmware:**  
[`firmware_heltec_tracker_v1_2.bin`](firmware_heltec_tracker_v1_2.bin)

</td>
</tr>
</table>

---

## 🔌 Supported Development Boards

This firmware supports the following Heltec development boards:

### Heltec Wireless Stick V3.1
**Used in:** Specfive MiniTrekker

**Key Features:**
- ESP32-S3FN8 dual-core microcontroller (up to 240MHz)
- Semtech SX1262 LoRa transceiver
- WiFi 802.11 b/g/n and Bluetooth 5.0
- 0.96-inch OLED display (128x64)
- USB Type-C interface
- Dedicated 2.4GHz antenna for WiFi/Bluetooth
- U.FL/IPEX connector for LoRa antenna
- Integrated 3.7V lithium battery interface with charge management
- Dimensions: 58.08 × 22.6 × 8.2 mm

**Firmware File:** `firmware_heltec_wireless_v3_1.bin`

### Heltec Tracker V1.2
**Used in:** Specfive Trekker Bravo

**Key Features:**
- ESP32-S3FN8 dual-core microcontroller (up to 240MHz)
- Semtech SX1262 LoRa transceiver
- UC6580 GNSS module (GPS, GLONASS, BDS, Galileo, NAVIC, QZSS)
- 0.96-inch LCD display (160×80 pixels)
- WiFi 802.11 b/g/n and Bluetooth 5.0
- USB Type-C interface
- Integrated lithium battery management (SH1.25-2 connector)
- 2.4GHz metal spring antenna
- Built-in GPS antenna

**Firmware File:** `firmware_heltec_tracker_v1_2.bin`

---

## 📋 Firmware Mapping

| Product | Development Board | Firmware File |
|---------|-------------------|---------------|
| **Specfive MiniTrekker** | Heltec Wireless Stick V3.1 | [`firmware_heltec_wireless_v3_1.bin`](firmware_heltec_wireless_v3_1.bin) |
| **Specfive Trekker Bravo** | Heltec Tracker V1.2 | [`firmware_heltec_tracker_v1_2.bin`](firmware_heltec_tracker_v1_2.bin) |

---

## 🚀 Flashing the Firmware

### Prerequisites

Before flashing, ensure you have:
- A compatible Specfive device (MiniTrekker or Trekker Bravo)
- USB cable for connecting the device to your computer
- Appropriate USB drivers installed

### Download the Firmware

1. Navigate to the [Releases](../../releases) page or download directly from this repository
2. Select the appropriate firmware file for your device:
   - **MiniTrekker** → `firmware_heltec_wireless_v3_1.bin`
   - **Trekker Bravo** → `firmware_heltec_tracker_v1_2.bin`

### Required Tools

You will need the **ESP32 Flash Download Tool** to flash the firmware onto your device.

🔗 **Download ESP32 Flash Download Tool:**  
https://docs.espressif.com/projects/esp-test-tools/en/latest/esp32s3/production_stage/tools/flash_download_tool.html

### Step-by-Step Flashing Instructions

#### 1. Connect Your Device
Connect your **Specfive MiniTrekker** or **Specfive Trekker Bravo** to your computer via a USB cable.

#### 2. Open Flash Tool
Launch the **ESP32 Flash Download Tool** on your computer.

#### 3. Select COM Port
Choose the **COM port** (Windows) or **Serial port** (macOS/Linux) where your device is connected.

**Finding your COM port (Windows):** Open **Device Manager** → expand **Ports (COM & LPT)** → look for **USB Serial Device** (or CH340/CP210x depending on your board). The number in parentheses (e.g., COM39) is the port to select.

![Finding COM port for Heltec device](com_port_finding.png)

#### 4. Configure Flash Settings
- **Flash Address:** `0x0000` (default)
- **Flash Size:** Select appropriate size for your board
- **Flash Speed:** `40MHz` (recommended)

#### 5. Load Firmware
- Click **Browse** or **Add** button
- Navigate to and select the downloaded firmware file:
  - `firmware_heltec_wireless_v3_1.bin` for MiniTrekker
  - `firmware_heltec_tracker_v1_2.bin` for Trekker Bravo

#### 6. Start Flashing
1. Click **Start** to begin uploading the firmware to your device
2. Wait for the flashing process to complete (progress bar will show status)
3. You should see a "Finish" message when successful

#### 7. Reboot Device
After the flashing process completes:
1. Disconnect the USB cable
2. Power cycle the device (turn off and on)
3. The device should now be running the new firmware

---

## 🔧 Troubleshooting

### Device Not Detected
- Ensure the correct **USB drivers** for your device are installed
- Try a different **USB cable** (data-capable cable required)
- Try a different **USB port** on your computer
- Check Device Manager (Windows) or System Information (macOS) for COM port detection

### Flashing Fails to Start
- **Press and hold the BOOT button** on your Heltec device during the flashing process
- Ensure the device is in **download mode** before starting
- Check that the correct COM port is selected
- Verify the firmware file is not corrupted (re-download if necessary)

### Flashing Process Interrupted
- Do not disconnect the device during flashing
- Ensure stable USB connection
- Close other applications that might be using the serial port
- Retry the flashing process

### Device Not Responding After Flash
- Perform a factory reset if available
- Verify the correct firmware file was flashed for your device model
- Check device power supply and battery status
- Contact support if issues persist

---

## 📚 Additional Resources

- [Heltec Wireless Stick V3.1 Documentation](https://heltec.org/project/wireless-stick-v3/)
- [Heltec Tracker V1.2 Documentation](https://heltec.org/project/tracker-v1/)
- [ESP32-S3 Technical Reference](https://www.espressif.com/sites/default/files/documentation/esp32-s3_technical_reference_manual_en.pdf)

---

## 📝 Notes

- Always ensure you're flashing the correct firmware file for your specific device model
- Keep a backup of your current firmware before upgrading
- Firmware updates may reset device configuration to defaults
- For production devices, follow your organization's firmware update procedures

---


## 🤝 Support

For firmware-related issues or questions:
- Open an issue in this repository
- Contact Specfive support team
- Refer to the troubleshooting section above

---

**Last Updated:** January 2026
