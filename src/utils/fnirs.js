let port;
let writer;
let reader;
let currentCondition = 1;

///to do: make dynamic
export async function connectToDevice() {
  try {
    console.log("test3.3");
    // request port and open connection
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

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

export async function flushDevice() {
  if (!writer) {
    console.error("1Device not connected.");
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
      Math.floor(conditionCode)
    )}${String.fromCharCode(0)}`;
    console.log("Command to send:", command);

    await flushDevice();
    await sendTriggerToDevice(command);

    console.log("Command sent successfully.");

    currentCondition++;
  } catch (error) {
    console.error("Failed to send trigger to device:", error);
  }
}

let uniqueCounter = 0; // Global counter to ensure uniqueness

function getConditionCode(count) {
  let baseCode;
  if (count === 1 || count === 42 || count === 63) {
    baseCode = 1; // "Rest #1", "Rest #2", "Rest #3"
  } else if (count >= 2 && count <= 21) {
    baseCode = 2; // "Condition 1"
  } else if (count >= 22 && count <= 41) {
    baseCode = 3; // "MIST20"
  } else if (count >= 43 && count <= 62) {
    baseCode = 4; // "Condition 2"
  } else {
    baseCode = 0; // Fallback (should NOT happen)
  }

  // Append a unique identifier to the base code
  const uniqueCode = baseCode + uniqueCounter++ / 100;
  return uniqueCode;
}