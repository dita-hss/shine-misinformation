let port;
let writer;
let reader;
let currentCondition = 1;

const conditionMapping = {
  1: [3, 5, 7], // Rest (Stimulus Channel 1)
  2: [6, 10, 18], // Condition 1 (Stimulus Channel 2)
  3: [20, 28, 60], // Condition 2 (Stimulus Channel 3)
  4: [40, 56, 72], // Condition 3 (Stimulus Channel 4)
};

let conditionIndex = { 1: 0, 2: 0, 3: 0, 4: 0 };

///to do: make dynamic
export async function connectToDevice() {
  try {
    console.log("test5.1");
    // request port and open connection
    port = await navigator.serial.requestPort();
    await port.open({
      baudRate: 115200
    });

    // set up writer and reader
    const textEncoder = new TextEncoderStream();
    const textDecoder = new TextDecoderStream();

    textEncoder.readable.pipeTo(port.writable);
    reader = port.readable.pipeThrough(textDecoder).getReader();

    writer = textEncoder.writable.getWriter();
    await setPulseDuration(1000);

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
    const logicalCode = getLogicalCondition(currentCondition); 
    const uniqueCode = getConditionCode(logicalCode);
    console.log(
      "Post index:",
      postIndex,
      "Logical condition:",
      logicalCode,
      "Unique code:",
      uniqueCode,
      "Current condition:",
      currentCondition
    );

    const command = `mh${String.fromCharCode(uniqueCode)}${String.fromCharCode(
      0
    )}`;
    console.log("Command to send:", command);

    await flushDevice();
    await delay(100);
    await sendTriggerToDevice(command);
    await delay(100);
    await flushDevice();
    console.log("Command sent successfully.");
    currentCondition++;
  } catch (error) {
    console.error("Failed to send trigger to device:", error);
  }
}

function getLogicalCondition(count) {
  if (count === 1 || count===  22|| count === 42) {
    return 1; // "Rest"
  } else if (count >= 2 && count <= 21) {
    return 2; // "Condition 1"
  } else if (count >= 22 && count <= 41) {
    return 3; // "Condition 2"
  } else if (count >= 43 && count <= 63) {
    return 4; // "Condition 3"
  }
  return 0; // Fallback (should NOT happen)
}

function getConditionCode(logicalCode) {
  if (!conditionMapping[logicalCode]) {
    throw new Error(`Invalid logical condition code: ${logicalCode}`);
  }

  const currentIndex = conditionIndex[logicalCode];
  const uniqueCodes = conditionMapping[logicalCode];
  conditionIndex[logicalCode] = (currentIndex + 1) % uniqueCodes.length;

  return uniqueCodes[currentIndex];
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
