const timestamps = {
  absolute: {}, // Stores absolute timestamps { eventType: ["HH:MM:SS", ...] }
  relative: {}, // Stores relative timestamps { eventType: [0, 2000, 5000, ...] }
  chronological: [], // Stores events in chronological order [{ eventType, absolute, relative }]
  relativeChronological: [], // Stores only relative times in order [0, 2000, 5000, ...]
  onlyTriggerRelative: [], // Stores only relative times for trigger events in order
  startTime: null, // Stores the first timestamp to calculate relative times
};

/**
 * Logs a timestamp for an event.
 * @param {string} eventType - The event type ("rest", "firstshown", "interactions", "disappear").
 */
function logTimestamp(eventType) {
  const now = new Date();
  const time = Date.now();
  const date = new Date(time);

  // Format the absolute timestamp
  const datePart = date.toLocaleDateString(); // MM/DD/YYYY format
  const timePart = date.toLocaleTimeString(); // HH:MM:SS AM/PM
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  const formattedTime = `${datePart}, ${timePart.slice(0, -3)}.${milliseconds} ${timePart.slice(-2)}`;

  const currentTimeMs = now.getTime();

  if (!timestamps.startTime) {
    timestamps.startTime = currentTimeMs; // First timestamp reference
  }

  const relativeTime = currentTimeMs - timestamps.startTime; // Relative time in ms

  // Ensure lists exist for event type
  if (!timestamps.absolute[eventType]) {
    timestamps.absolute[eventType] = [];
    timestamps.relative[eventType] = [];
  }

  // Append timestamps
  timestamps.absolute[eventType].push(formattedTime); // Using formatted time
  timestamps.relative[eventType].push(relativeTime);

  // Append to chronological list
  timestamps.chronological.push({
    eventType,
    absolute: formattedTime, // Using formatted time
    relative: relativeTime,
  });

  // Append only the relative time to the new list
  timestamps.relativeChronological.push(relativeTime);

  if (eventType === "rest" || eventType === "firstshown") {
    timestamps.onlyTriggerRelative.push(relativeTime);
  }

  console.log(
    `[Timestamp Logged] ${eventType}: ${formattedTime} (${relativeTime}ms)`
  );
  console.log("Current dictionary of timestamps:", timestamps);
}

/**
 * Retrieves collected timestamps.
 * @returns {object} The timestamp data.
 */
function getTimestamps() {
  return timestamps;
}

/**
 * Retrieves chronological event log.
 * @returns {Array} Chronological event list.
 */
function getChronologicalTimestamps() {
  return timestamps.chronological;
}

/**
 * Retrieves only the relative chronological timestamps.
 * @returns {Array} List of relative times in order.
 */
function getRelativeChronologicalTimestamps() {
  return timestamps.relativeChronological;
}

/**
 * Resets timestamp tracking for a new session.
 */
function resetTimestamps() {
  timestamps.startTime = null;
  timestamps.absolute = {};
  timestamps.relative = {};
  timestamps.chronological = []; // Reset chronological list
  timestamps.relativeChronological = []; // Reset relative chronological list
  timestamps.onlyTriggerRelative = []; // Reset only trigger relative list
}

// Export functions
module.exports = {
  logTimestamp,
  getTimestamps,
  getChronologicalTimestamps,
  getRelativeChronologicalTimestamps,
  resetTimestamps,
};
