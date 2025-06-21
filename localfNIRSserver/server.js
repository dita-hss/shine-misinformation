const express = require("express");
const bodyParser = require("body-parser");
const { SerialPort } = require("serialport");

const app = express();
const port = 5000;

const fNIRS = new SerialPort({
  path: "COM3",
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
  flowControl: false
});

app.use(bodyParser.json());

app.post("/sendTrigger", (req, res) => {
  const { condition, postIndex } = req.body;
  console.log(`Received trigger: condition=${condition}, postIndex=${postIndex}`);
  const logicalCode = getLogicalCondition(condition);
  const uniqueCode = getConditionCode(logicalCode);

  // Construct trigger command: e.g., "mh" + code + 0
  const triggerCommand = Buffer.from([109, 104, uniqueCode, 0]); // "mh" + uniqueCode + null byte

  fNIRS.write(triggerCommand, (err) => {
    if (err) {
      console.error("Error writing to serial port:", err.message);
      return res.status(500).send("Failed to send trigger");
    }
    console.log(`Sent trigger: mh ${uniqueCode}`);
    res.sendStatus(200);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const conditionMapping = {
  1: [1], // Rest
  2: [2], // Condition 1
  3: [3], // Condition 2
  4: [4], // Condition 3
};

let conditionIndex = { 1: 0, 2: 0, 3: 0, 4: 0 };

function getLogicalCondition(count) {
  if (count === 1 || count === 22 || count === 43) return 1;
  else if (count >= 2 && count <= 21) return 2;
  else if (count >= 23 && count <= 42) return 3;
  else if (count >= 44 && count <= 63) return 4;
  return 0; // Fallback
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