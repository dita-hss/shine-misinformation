let port;
let writer;
let reader;
let currentCondition = 1;

///to do: make dynamic
export async function connectToDevice() {
  try {
    console.log("test2.1");
    // request port and open connection
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

    console.log("Port Information:", port.getInfo());


    // set up writer and reader
    const textEncoder = new TextEncoderStream();
    const textDecoder = new TextDecoderStream();

    textEncoder.readable.pipeTo(port.writable);
    reader = port.readable.pipeThrough(textDecoder).getReader();

    writer = textEncoder.writable.getWriter();

    console.log("Device connected successfully.");
  } catch (error) {
    console.error("Failed to connect to device:", error);
  }
}

// let device;

// export async function connectToDevice() {
//   try {
//     console.log("Requesting USB device...");

//     // Request the USB device (replace vendorId with your device's ID)
//     device = await navigator.usb.requestDevice({
//       filters: [{ vendorId: 1027 }], // Replace with the correct Vendor ID
//     });

//     // Open the device and select configuration
//     await device.open();
//     await device.selectConfiguration(1);
//     await device.claimInterface(0); // Most devices use interface 0

//     console.log("Device connected successfully:", device.productName);

//     // Inspect device configurations and endpoints
//     inspectDeviceEndpoints(device);
//   } catch (error) {
//     console.error("Failed to connect to USB device:", error);
//   }
// }

// function inspectDeviceEndpoints(device) {
//   console.log("Inspecting device configurations...");

//   device.configurations.forEach((config, configIndex) => {
//     console.log(`Configuration ${configIndex + 1}:`, config);

//     config.interfaces.forEach((iface, ifaceIndex) => {
//       console.log(`  Interface ${ifaceIndex + 1}:`, iface);

//       iface.alternates.forEach((alt, altIndex) => {
//         console.log(`    Alternate Setting ${altIndex + 1}:`, alt);

//         alt.endpoints.forEach((endpoint, epIndex) => {
//           console.log(`      Endpoint ${epIndex + 1}:`);
//           console.log(`        Endpoint Number: ${endpoint.endpointNumber}`);
//           console.log(`        Direction: ${endpoint.direction}`); // 'in' or 'out'
//           console.log(`        Type: ${endpoint.type}`); // 'bulk', 'interrupt', etc.
//         });
//       });
//     });
//   });
// }


export async function flushDevice() {
  if (!writer || !reader) {
    console.error("Device not connected.");
    return;
  }
  try {
    await writer.write("\n");
    while (true) {
      const { value, done } = await reader.read();
      console.log("Flushing device:", value);
      if (done || !value) break;
    }

    console.log("Device flushed successfully.");
  } catch (error) {
    console.error("Failed to flush device:", error);
  }
}

export async function queryDevice() {
  if (!writer || !reader) {
    console.error("2Device not connected.");
    return false;
  }

  try {
    await writer.write("_c1");
    console.log("Query sent to device.");

    const response = await readResponse(5);
    console.log("Response from device:", response);

    return response === "_xid0";
  } catch (error) {
    console.error("Failed to query device:", error);
    return false;
  }
}

export async function setPulseDuration(duration) {
  if (!writer) {
    console.error("3Device not connected.");
    return;
  }

  try {
    const bytes = [
      getByte(duration, 1),
      getByte(duration, 2),
      getByte(duration, 3),
      getByte(duration, 4),
    ];
    const command = `mp${String.fromCharCode(...bytes)}`;
    await writer.write(command);
    console.log("Pulse duration set successfully:", duration);
  } catch (error) {
    console.error("Failed to set pulse duration:", error);
  }
}

export async function sendTriggerToDevice(command) {
  if (!writer) {
    console.error("4Device not connected.");
    return;
  }
  try {
    console.log("Sending command to device:", command);
    await writer.write(`${command}\r\n`);
    console.log("Command sent successfully:", command);
  } catch (error) {
    console.error("Failed to send trigger to device:", error);
  }
}

function getByte(val, index) {
  return (val >> (8 * (index - 1))) & 255;
}

async function readResponse(length) {
  let result = "";
  try {
    while (result.length < length) {
      const { value, done } = await reader.read();
      if (done) break;
      result += value;
    }
  } catch (error) {
    console.error("Error reading response:", error);
  }
  return result;
}

export async function sendTrigger(postIndex) {
  try {
    console.log("Preparing to send trigger...");

    const conditionCode = getConditionCode(currentCondition);

    console.log(
      "Post index:",
      postIndex,
      "Condition:",
      conditionCode,
      "Current condition:",
      currentCondition
    );

    const command = `mh${String.fromCharCode(
      conditionCode
    )}${String.fromCharCode(0)}`;
    console.log("Command to send:", command);

    await sendTriggerToDevice(command);
    await delay(100);
    const resetCommands = [
      "reset",
      "RESET",
      "*CLS", // SCPI clear status command (sometimes acts as a soft reset)
      "clear",
      "CLEAR",
      "init",
      "INIT",
      "esc", // Escape character (ASCII 27)
      String.fromCharCode(0x1b), // ESC key in ASCII
      String.fromCharCode(0x03), // CTRL+C (common interrupt signal)
      String.fromCharCode(0x04), // CTRL+D (end-of-transmission signal)
    ];

    // Try all reset commands
    for (const command of resetCommands) {
      try {
        console.log(`Trying reset command: ${command}`);
        await sendTriggerToDevice(command);
        await delay(500); // Add a delay after each command
      } catch (error) {
        console.error(`Failed to send reset command: ${command}`, error);
      }
    }
    await flushDevice();

    console.log("Command sent successfully.");

    currentCondition++;
  } catch (error) {
    console.error("Failed to send trigger to device:", error);
  }
}

function getConditionCode(count) {
  if (count === 1 || count === 42 || count === 63) {
    return 1; // "Rest #1", "Rest #2", "Rest #3"
  } else if (count >= 2 && count <= 21) {
    return 2; // "Condition 1"
  } else if (count >= 22 && count <= 41) {
    return 3; // "MIST20"
  } else if (count >= 43 && count <= 62) {
    return 4; // "Condition 2"
  }
  return 0; // Fallback (should NOT happen)
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

