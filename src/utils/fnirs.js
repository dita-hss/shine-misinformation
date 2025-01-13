let port;
let writer;
let reader;

export async function connectToDevice() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

    const textEncoder = new TextEncoderStream();
    const textDecoder = new TextDecoderStream();

    writer = textEncoder.writable.getWriter();
    reader = textDecoder.readable
      .pipeThrough(new TextDecoderStream())
      .getReader();

    console.log("Device connected");
  } catch (error) {
    console.error("Failed to connect to device:", error);
  }
}

export async function flushDevice() {
  if (!writer) {
    console.error("Device not connected.");
    return;
  }
  await writer.write("");
}

export async function queryDevice() {
  if (!writer) {
    console.error("Device not connected.");
    return false;
  }

  await writer.write("_c1");
  const queryReturn = await readResponse(5);
  return queryReturn === "_xid0";
}

export async function setPulseDuration(duration) {
  if (!writer) {
    console.error("Device not connected.");
    return;
  }

  const bytes = [
    getByte(duration, 1),
    getByte(duration, 2),
    getByte(duration, 3),
    getByte(duration, 4),
  ];
  const command = `mp${String.fromCharCode(...bytes)}`;
  await writer.write(command);
}

function getByte(val, index) {
  return (val >> (8 * (index - 1))) & 255;
}

async function readResponse(length) {
  let result = "";
  while (result.length < length) {
    const { value, done } = await reader.read();
    if (done) break;
    result += value;
  }
  return result;
}

export async function sendTriggerToDevice(command) {
  if (!writer) {
    console.error("Device not connected.");
    return;
  }
  try {
    await writer.write(command);
    console.log("Command sent to device:", command);
  } catch (error) {
    console.error("Failed to send command to device:", error);
  }
}

