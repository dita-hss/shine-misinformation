let port;
let writer;
let reader;

///to do: make dynamic
export async function connectToDevice() {
  try {
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
    // Send query
    await writer.write("_c1");
    console.log("Query sent to device.");

    // Read response
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
    console.log("Preparing to send trigger...");
    const condition = Math.floor(postIndex / 20) + 1;
    console.log("Post index:", postIndex, "Condition:", condition);

    const command = `mh${String.fromCharCode(condition)}${String.fromCharCode(0)}`;
    console.log("Command to send:", command);

    await sendTriggerToDevice(command);
    console.log("Command sent successfully.");
  } catch (error) {
    console.error("Failed to send trigger to fNIRS device:", error);
  }
}

