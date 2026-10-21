export type GuideId = "device" | "app" | "protocol";

export type GuideSection = {
  id: string;
  title: string;
  paragraphs: string[];
  code?: { label: string; language: string; value: string };
  note?: string;
};

export const deviceSections: GuideSection[] = [
  {
    id: "prepare-device",
    title: "1. Create a sensor",
    paragraphs: [
      "Ask an admin to create a sensor unit for your measurement or actuator. A temperature unit can use a number value; a switch can use fixed values such as on and off.",
      "Sign in to Iotku, open Add Device, select New Device, choose the unit, and set a passkey. Save the generated sensor code (for example 00001). The code identifies the sensor; the passkey authorizes its device connection.",
    ],
    note: "Use your own code and passkey. Never put a real passkey in screenshots, source control, or a public guide.",
  },
  {
    id: "connect-device",
    title: "2. Connect as a device",
    paragraphs: [
      "Open one WebSocket connection for this sensor. Put the sensor code, passkey, and is_device=1 in the connection URL. The server allows only one active device connection for a sensor.",
      "Replace localhost with the server's reachable host or IP when the device runs on another machine. Use wss:// when the server is deployed with TLS.",
    ],
    code: {
      label: "Device connection (JavaScript example)",
      language: "javascript",
      value: `let socket;
let retry = true;

function connectDevice() {
  const url = new URL("ws://localhost:4002");
  url.searchParams.set("idsensor", "00001");
  url.searchParams.set("passkey", "YOUR_PASSKEY");
  url.searchParams.set("is_device", "1");
  socket = new WebSocket(url);
  socket.addEventListener("open", () => console.log("Device connected"));
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "error") {
      console.error(message.message);
      retry = false; // Fix the passkey or duplicate device before retrying.
      return;
    }
    void handleDeviceMessage(message); // Implemented in step 4
  });
  socket.addEventListener("close", () => {
    if (retry) setTimeout(connectDevice, 2000);
  });
}
connectDevice();`,
    },
    note: "If the passkey is wrong or another device is connected, the server sends an error and closes the socket. Inspect the error message before retrying.",
  },
  {
    id: "publish-reading",
    title: "3. Publish the actual value",
    paragraphs: [
      "After the socket opens, send a JSON message with value. recorded_at_ms is optional and uses Unix milliseconds; the server uses its current time if omitted. The server stores the reading and broadcasts sensor_reading to all subscribers.",
      "For a switch or fixed-value unit, send exactly one configured value. Do not send a desired state as if it were an observed state.",
    ],
    code: {
      label: "Device to server",
      language: "json",
      value: '{\n  "value": "27.5",\n  "recorded_at_ms": 1760000000000\n}',
    },
  },
  {
    id: "receive-command",
    title: "4. Execute commands and report the result",
    paragraphs: [
      "A command arrives only on the active device socket. Read data.value and data.command_id. Apply the requested action to your hardware, then read its real state before reporting success.",
      "A matching reading from this device confirms the command and cancels its 30-second timeout. Include command_id to avoid confusing a periodic reading with a command response. If the action fails, send command_result with success=false and a useful reason.",
    ],
    code: {
      label: "Device handler (adapt the hardware functions)",
      language: "javascript",
      value: `async function handleDeviceMessage(message) {
  if (message.type !== "command") return;
  const { command_id, value } = message.data;
  try {
    await applyToHardware(value);
    const actualValue = await readActualState();
    socket.send(JSON.stringify({
      value: actualValue,
      command_id,
      recorded_at_ms: Date.now()
    }));
  } catch (error) {
    socket.send(JSON.stringify({
      type: "command_result",
      command_id,
      success: false,
      message: String(error?.message || "Action failed")
    }));
  }
}`,
    },
    note: "If you send a successful command_result instead, also publish the actual state as a reading so every subscriber updates. Only one command per sensor can be pending at once.",
  },
  {
    id: "device-reconnect",
    title: "5. Handle disconnects",
    paragraphs: [
      "On disconnect, reconnect with a short delay. Do not create overlapping connections: an old socket can make the next handshake fail as a duplicate device. The server marks the sensor offline when its device socket closes.",
      "Verify the flow by publishing a value and watching it appear in a subscribed app, then sending a command from the app and checking the device response.",
    ],
  },
];

export const appSections: GuideSection[] = [
  {
    id: "app-access",
    title: "1. Sign in and get sensor access",
    paragraphs: [
      "Create a user account in the Iotku app or use an account provided by your instructor. The HTTP API uses a login cookie. In a browser, include credentials on requests; a mobile client must retain and resend the cookie.",
      "GET /api/sensor returns sensors you own or have joined, including each sensor's internal id and public code. If someone shared a sensor with you, POST /api/sensor/join with its code and passkey first. Use the internal id for HTTP detail/history and the code for WebSocket messages.",
    ],
    code: {
      label: "HTTP setup (browser JavaScript)",
      language: "javascript",
      value: `const apiBase = "http://localhost:8082";
await fetch(apiBase + "/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ username: "YOUR_USERNAME", password: "YOUR_PASSWORD" })
});

const response = await fetch(apiBase + "/api/sensor", {
  credentials: "include"
});
const { data: sensors } = await response.json();
const sensorCode = sensors[0].code; // Example: "00001"`,
    },
    note: "Check HTTP status and the response body in your own app before using sensors[0]. For a separate web origin, the backend's FRONTEND_ORIGIN must allow that origin.",
  },
  {
    id: "app-subscribe",
    title: "2. Connect once and subscribe",
    paragraphs: [
      "Open one WebSocket connection for the app session. After it opens, subscribe to the sensor codes needed on the current screen and request device_info for their online status. When leaving that screen, unsubscribe; you can keep the socket open.",
      "After reconnecting, subscribe again because the server does not keep rooms from a closed socket. A frontend socket does not use a device passkey or is_device=1.",
    ],
    code: {
      label: "App connection (browser JavaScript)",
      language: "javascript",
      value: `const wsUrl = "ws://localhost:4002";
let codes = [sensorCode]; // From the HTTP sensor list in step 1
let socket;
let stopped = false;

function connect() {
  socket = new WebSocket(wsUrl);
  socket.addEventListener("open", () => {
    if (codes.length) {
      socket.send(JSON.stringify({ type: "subscribe", idsensor: codes }));
      socket.send(JSON.stringify({ type: "device_info", idsensor: codes }));
    }
  });
  socket.addEventListener("message", handleMessage); // See step 3
  socket.addEventListener("close", () => {
    if (!stopped) setTimeout(connect, 2000);
  });
}
connect();

// Update rooms when a screen opens or closes:
function showSensors(nextCodes) {
  const previousCodes = codes;
  codes = nextCodes;
  if (socket.readyState === WebSocket.OPEN) {
    if (previousCodes.length) socket.send(JSON.stringify({ type: "unsubscribe", idsensor: previousCodes }));
    if (codes.length) {
      socket.send(JSON.stringify({ type: "subscribe", idsensor: codes }));
      socket.send(JSON.stringify({ type: "device_info", idsensor: codes }));
    }
  }
}
// Call showSensors([]) when leaving the screen.

// When the user signs out, stop reconnecting:
function disconnect() {
  stopped = true;
  socket.close();
}`,
    },
  },
  {
    id: "app-events",
    title: "3. Render realtime events",
    paragraphs: [
      "Handle sensor_reading to show the latest value and recorded_at_ms. Handle device_info (an array) to show online/offline status. The HTTP sensor list includes latest_reading, so the screen can show a value before the next WebSocket event arrives.",
      "If your app shows history, fetch GET /api/sensor/:id/readings over HTTP. WebSocket readings are live updates; they do not replace the initial history request.",
    ],
    code: {
      label: "Incoming event handler",
      language: "javascript",
      value: `function handleMessage(event) {
  const message = JSON.parse(event.data);
  if (message.type === "sensor_reading") {
    updateValue(message.data.sensor_code, message.data.reading);
  } else if (message.type === "device_info") {
    for (const device of message.data) updateStatus(device);
  } else if (message.type === "command_result") {
    showCommandResult(message.success, message.message);
  } else if (message.type === "error") {
    showError(message.message);
  }
}`,
    },
  },
  {
    id: "app-command",
    title: "4. Send a command",
    paragraphs: [
      "Subscribe to the sensor first. Send a command only when the socket and device are online. The immediate command acknowledgement means the server forwarded it; wait for command_result or a new sensor_reading before showing the new state as confirmed.",
      "The server sends command_result only to the app socket that issued the command. A successful reading is sent to every subscriber. If the device fails, disconnects, or does not answer within 30 seconds, the sender receives a failure result.",
    ],
    code: {
      label: "Send command from the app",
      language: "javascript",
      value: `if (socket.readyState === WebSocket.OPEN) {
  socket.send(JSON.stringify({
    type: "command",
    idsensor: sensorCode,
    value: "off"
  }));
}`,
    },
    note: "For switch or enum devices, command values must match the unit's configured value_options exactly.",
  },
  {
    id: "app-check",
    title: "5. Check the complete flow",
    paragraphs: [
      "Start a device (or use the simulator), open two subscribed app clients, and publish a reading. Both apps should update. Send a command from one app: the device should receive it, the sender should receive command_result, and both apps should show the new reading.",
      "Close the device connection and confirm device_info reports connection_status=false. Reconnect the app socket and confirm it resubscribes. If you use a mobile or separate web app, replace localhost with a host reachable from that device.",
    ],
  },
];

export const protocolRows = [
  {
    message: "subscribe / unsubscribe",
    from: "App to server",
    purpose: "Join or leave rooms; idsensor is an array of sensor codes.",
  },
  {
    message: "device_info",
    from: "Both directions",
    purpose: "Request with idsensor array; receive an array of device connection states.",
  },
  {
    message: "sensor_reading",
    from: "Server to subscribers",
    purpose: "Saved reading with sensor_code and reading fields.",
  },
  {
    message: "command",
    from: "App to device",
    purpose: "Request a value; server supplies command_id and a delivery acknowledgement.",
  },
  {
    message: "command_result",
    from: "Device to sender",
    purpose: "Report success or failure for command_id; only the requesting app gets the result.",
  },
  {
    message: "error",
    from: "Server to sender",
    purpose: "Validation or handshake failure with a readable message.",
  },
];
