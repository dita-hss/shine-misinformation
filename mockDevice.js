const { SerialPort } = require("serialport");

const mockPort = new SerialPort({
  path: "/dev/ttys020", // The first port from `socat`
  baudRate: 115200,
  autoOpen: false,
});

mockPort.open((err) => {
  if (err) {
    console.error("Failed to open mock device:", err);
    return;
  }
  console.log("Mock serial device started on /dev/ttys014");
});

// Simulate incoming data
setInterval(() => {
  mockPort.write("Mock device: Hello VS Code!\n");
}, 2000);
