import { versionHandler } from "../utils/versionHandler";

let port;
let writer;
let reader;
let currentCondition = 1;

const conditionMapping = {
  1: [1], // Rest (Stimulus Channel 1)
  2: [2], // Condition 1 (Stimulus Channel 2)
  3: [3], // Condition 2 (Stimulus Channel 3)
  4: [4] // Condition 3 (Stimulus Channel 4)
};

let conditionIndex = { 1: 0, 2: 0, 3: 0, 4: 0 };

///to do: make dynamic
export async function connectToDevice() {
  try {
    //console.log("test12");
    // request port and open connection
    port = await navigator.serial.requestPort();
    await port.open({
      baudRate: 115200, 
      dataBits: 8,
      stopBits: 1,
      parity: "none",
      flowControl: "none",
    });

    // set up writer and reader
    writer = port.writable.getWriter();
    reader = port.readable.getReader(); // For reading responses if needed

    //await setPulseDuration(1000);

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
    await writer.write("\r\n");
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
    const command = `_c1\n`;
    await writer.write(new TextEncoder().encode(command));

    console.log("Query sent to device.");

    const response = await readResponse(5);

    const responseString = "_xid0";
    const encoder = new TextEncoder();
    const responseBytes = encoder.encode(responseString);

    console.log("Response in bytes (Uint8Array):", responseBytes);

    console.log("Response from device:", response);

    return response === "_xid0" || response === responseBytes;
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
    const command = `mp${String.fromCharCode(...bytes)}\n`;
    await writer.write(new TextEncoder().encode(command));
    console.log("Pulse duration set successfully:", duration);
  } catch (error) {
    console.error("Failed to set pulse duration:", error);
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
      uniqueCode
    );

    const command = `mh${String.fromCharCode(uniqueCode)}${String.fromCharCode(0)}\n`;

    await delay(100);
    // await writer.write(new TextEncoder().encode(command));
    // await writer.write(new Uint8Array([109, 104, uniqueCode, 0]));
    // await writer.write(command);

    await fetch("http://localhost:5000/sendTrigger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uniqueCode, // computed in the browser
        postIndex, // for logging/tracking
      }),
    });

    await delay(100);
    //await flushDevice();
    console.log("Command sent successfully.");
    currentCondition++;
  } catch (error) {
    console.error("Failed to send trigger to device:", error);
  }
}

function getLogicalCondition(count) {
  const version = versionHandler.getVersion();

  if (version === "1") {
    if (count === 1 || count === 22 || count === 43) {
      return 1; // "Rest"
    } else if (count >= 2 && count <= 21) {
      return 2; // "Condition 1"
    } else if (count >= 23 && count <= 42) {
      return 3; // "Condition 2"
    } else if (count >= 44 && count <= 63) {
      return 4; // "Condition 3"
    }
  } else if (version === "2") {
    if (count === 1 || count === 22 || count === 43) {
      return 1; // "Rest"
    } else if (count >= 2 && count <= 21) {
      return 4; // "Condition 3"
    } else if (count >= 23 && count <= 42) {
      return 2; // "Condition 1" 
    } else if (count >= 44 && count <= 63) {
      return 3; // "Condition 2"
    }
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
