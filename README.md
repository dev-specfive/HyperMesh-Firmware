## Flashing the Firmware

### Download the Firmware
Download the latest firmware from this repository.

### Required Tools
You will need the **ESP32 Flash Tool** to flash the firmware onto your device.  
You can download it from the official Espressif page:

🔗 **ESP32 Flash Download Tool:**  
https://docs.espressif.com/projects/esp-test-tools/en/latest/esp32s3/production_stage/tools/flash_download_tool.html

### Steps to Flash the Firmware

#### 1. Connect Your Device
Connect your **Spec5 Trekker Bravo** or **Spec5 MiniTrekker** to your computer via a USB cable.

#### 2. Open Flash Tool
Launch the **ESP32 Flash Tool** on your computer.

#### 3. Select COM Port
Choose the **COM port** where your device is connected.

#### 4. Load Firmware
Click **Browse**, then select the downloaded firmware file.

#### 5. Start Flashing
Press **Start** to begin uploading the firmware to your device.

#### 6. Reboot Device
After the flashing process completes, disconnect and reboot your device.

---

### Troubleshooting

- Ensure that the correct **drivers** for your device are installed.
- If flashing does not begin automatically, **press and hold the BOOT button** on your Heltec device during the flashing process.
- If the tool cannot detect your device, try:
  - Another USB cable  
  - Another USB port  
  - Reinstalling the USB drivers  
