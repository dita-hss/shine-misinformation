let port;
let writer;
let reader;
let currentCondition = 1;
let lastTriggerTime = 0;
const MINIMUM_TRIGGER_INTERVAL = 5000;

export async function connectToDevice() {
  try {
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
    const currentTime = Date.now();
    const timeSinceLastTrigger = currentTime - lastTriggerTime;

    console.log("Preparing to send trigger...");
    console.log("Time since last trigger:", timeSinceLastTrigger, "ms");

    if (timeSinceLastTrigger < MINIMUM_TRIGGER_INTERVAL) {
      const delayNeeded = MINIMUM_TRIGGER_INTERVAL - timeSinceLastTrigger;
      console.log(`Waiting ${delayNeeded}ms before sending next trigger...`);
      await new Promise((resolve) => setTimeout(resolve, delayNeeded));
    }

    const conditionCode = getConditionCode(currentCondition);

    console.log(
      "Post index:",
      postIndex,
      "Condition:",
      conditionCode,
      "Current condition:",
      currentCondition
    );

    await flushDevice();

    await new Promise((resolve) => setTimeout(resolve, 100));

    const command = `mh${String.fromCharCode(
      conditionCode
    )}${String.fromCharCode(0)}`;
    console.log("Command to send:", command);

    await sendTriggerToDevice(command);

    lastTriggerTime = Date.now();

    const verified = await verifyTriggerSent();
    if (!verified) {
      console.warn("Trigger may not have been properly received by device");
    }

    console.log("Command sent successfully.");
    currentCondition++;
  } catch (error) {
    console.error("Failed to send trigger to device:", error);
  }
}

async function verifyTriggerSent() {
  try {
    await writer.write("_q1");
    const response = await readResponse(5);
    return response === "_ack1";
  } catch (error) {
    console.error("Failed to verify trigger:", error);
    return false;
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
