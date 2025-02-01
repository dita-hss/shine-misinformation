let port;
let writer;
let reader;
let currentCondition = 1;
let lastTriggerTime = 0;
let lastConditionCode = null;
const MINIMUM_TRIGGER_INTERVAL = 250; // Increased slightly

export async function connectToDevice() {
  try {
    console.log("test5");
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

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

export async function flushDevice() {
  if (!writer) {
    console.error("Device not connected.");
    return;
  }
  try {
    await writer.write("");
    // Add a small pause after flush
    await new Promise((resolve) => setTimeout(resolve, 50));
    console.log("Device flushed successfully.");
  } catch (error) {
    console.error("Failed to flush device:", error);
  }
}

export async function queryDevice() {
  if (!writer || !reader) {
    console.error("Device not connected.");
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
    console.error("Device not connected.");
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
    console.error("Device not connected.");
    return;
  }
  try {
    console.log("Sending command to device:", command);
    await writer.write(command);
    await new Promise((resolve) => setTimeout(resolve, 50)); // Small pause after sending
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

async function sendResetCommand() {
  try {
    await writer.write("_r1");
    await new Promise((resolve) => setTimeout(resolve, 50));
  } catch (error) {
    console.error("Failed to send reset command:", error);
  }
}

export async function sendTrigger(postIndex) {
  try {
    const currentTime = Date.now();
    const timeSinceLastTrigger = currentTime - lastTriggerTime;

    if (timeSinceLastTrigger < MINIMUM_TRIGGER_INTERVAL) {
      const delayNeeded = MINIMUM_TRIGGER_INTERVAL - timeSinceLastTrigger;
      await new Promise((resolve) => setTimeout(resolve, delayNeeded));
    }

    const conditionCode = getConditionCode(currentCondition);

    // Try different approach for repeated triggers
    if (conditionCode === lastConditionCode) {
      // For repeated triggers, try sending a reset first
      await sendResetCommand();
    } else {
      // For different triggers, do a normal flush
      await flushDevice();
    }

    // Try a different command format that might force the device to see it as new
    const timestamp = Date.now() % 256; // Use timestamp as part of command
    const command = `mh${String.fromCharCode(
      conditionCode
    )}${String.fromCharCode(timestamp)}`;

    console.log("Sending trigger:", {
      postIndex,
      condition: conditionCode,
      timestamp,
      command,
    });

    await sendTriggerToDevice(command);

    lastConditionCode = conditionCode;
    lastTriggerTime = Date.now();
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
