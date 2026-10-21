import { Cable, Play, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import envVar from "../../../utils/envReader";

type SimulatorEvent = { id: number; direction: "in" | "out" | "system"; text: string };
type CommandMessage = {
  type?: string;
  data?: { command_id?: string; value?: string };
};

export const DeviceSimulator = () => {
  const [url, setUrl] = useState(String(envVar.WS_URL ?? "ws://localhost:4002"));
  const [sensorCode, setSensorCode] = useState("");
  const [passkey, setPasskey] = useState("");
  const [value, setValue] = useState("off");
  const [autoReply, setAutoReply] = useState(true);
  const [status, setStatus] = useState<"offline" | "connecting" | "online">("offline");
  const [events, setEvents] = useState<SimulatorEvent[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const autoReplyRef = useRef(autoReply);

  useEffect(() => {
    autoReplyRef.current = autoReply;
  }, [autoReply]);

  useEffect(() => () => socketRef.current?.close(), []);

  const log = (direction: SimulatorEvent["direction"], text: string) => {
    setEvents((previous) =>
      [{ id: Date.now() + Math.random(), direction, text }, ...previous].slice(0, 12),
    );
  };

  const connect = () => {
    if (status !== "offline" || !sensorCode.trim() || !passkey || !url.trim()) return;
    try {
      const target = new URL(url);
      if (target.protocol !== "ws:" && target.protocol !== "wss:") {
        throw new Error("Enter a ws:// or wss:// URL.");
      }
      target.searchParams.set("idsensor", sensorCode.trim());
      target.searchParams.set("passkey", passkey);
      target.searchParams.set("is_device", "1");

      const socket = new WebSocket(target.toString());
      socketRef.current = socket;
      setStatus("connecting");
      socket.onopen = () => {
        setStatus("online");
        log("system", "Device connected.");
      };
      socket.onmessage = (event: MessageEvent<string>) => {
        log("in", event.data);
        try {
          const message = JSON.parse(event.data) as CommandMessage;
          if (message.type !== "command" || !autoReplyRef.current || !message.data?.value) return;
          const reading = {
            value: message.data.value,
            command_id: message.data.command_id,
            recorded_at_ms: Date.now(),
          };
          socket.send(JSON.stringify(reading));
          log("out", JSON.stringify(reading));
          setValue(message.data.value);
        } catch {
          // Raw server messages remain visible in the event log.
        }
      };
      socket.onerror = () => log("system", "Connection error. Check the URL and server.");
      socket.onclose = () => {
        if (socketRef.current === socket) socketRef.current = null;
        setStatus("offline");
        log("system", "Device disconnected.");
      };
    } catch (error) {
      log("system", error instanceof Error ? error.message : "Invalid WebSocket URL.");
    }
  };

  const disconnect = () => socketRef.current?.close();

  const publish = () => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || !value.trim()) return;
    const reading = { value: value.trim(), recorded_at_ms: Date.now() };
    socket.send(JSON.stringify(reading));
    log("out", JSON.stringify(reading));
  };

  return (
    <section id="device-simulator" className="scroll-mt-24 border-t border-dark-200 pt-8">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-info-50 text-info-700">
          <Cable className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-dark-900">Try the device simulator</h2>
          <p className="mt-1 text-sm leading-6 text-dark-600">
            Test the protocol in your browser before connecting hardware. Use a test sensor and its
            passkey.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-dark-200 bg-white">
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <label className="block text-xs font-medium text-dark-700 sm:col-span-2">
            WebSocket URL
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={status !== "offline"}
              className="mt-1 w-full rounded-md border border-dark-200 px-3 py-2 text-sm text-dark-900 disabled:bg-light-100"
            />
          </label>
          <label className="block text-xs font-medium text-dark-700">
            Sensor code
            <input
              value={sensorCode}
              onChange={(event) => setSensorCode(event.target.value)}
              placeholder="00001"
              disabled={status !== "offline"}
              className="mt-1 w-full rounded-md border border-dark-200 px-3 py-2 text-sm text-dark-900 disabled:bg-light-100"
            />
          </label>
          <label className="block text-xs font-medium text-dark-700">
            Passkey
            <input
              type="password"
              value={passkey}
              onChange={(event) => setPasskey(event.target.value)}
              placeholder="Sensor passkey"
              autoComplete="off"
              disabled={status !== "offline"}
              className="mt-1 w-full rounded-md border border-dark-200 px-3 py-2 text-sm text-dark-900 disabled:bg-light-100"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            {status === "offline" ? (
              <button
                type="button"
                onClick={connect}
                disabled={!sensorCode.trim() || !passkey || !url.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                <Play className="h-4 w-4" /> Connect
              </button>
            ) : (
              <button
                type="button"
                onClick={disconnect}
                className="inline-flex items-center gap-2 rounded-md border border-dark-300 px-3 py-2 text-sm font-medium text-dark-700 hover:bg-light-100"
              >
                <Square className="h-4 w-4" /> Disconnect
              </button>
            )}
            <span
              className={`text-xs font-medium ${status === "online" ? "text-success-700" : "text-dark-500"}`}
            >
              {status === "online"
                ? "Online"
                : status === "connecting"
                  ? "Connecting..."
                  : "Offline"}
            </span>
          </div>
        </div>

        <div className="border-t border-dark-200 bg-light-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1 text-xs font-medium text-dark-700">
              Reading value
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="off or 27.5"
                className="mt-1 w-full rounded-md border border-dark-200 bg-white px-3 py-2 text-sm text-dark-900"
              />
            </label>
            <button
              type="button"
              onClick={publish}
              disabled={status !== "online" || !value.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-dark-800 px-3 py-2 text-sm font-medium text-white hover:bg-dark-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Send reading
            </button>
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-dark-600">
            <input
              type="checkbox"
              checked={autoReply}
              onChange={(event) => setAutoReply(event.target.checked)}
              className="accent-primary-600"
            />
            Automatically publish the requested value when a command arrives
          </label>
        </div>

        <div className="border-t border-dark-200 p-4">
          <p className="text-xs font-semibold text-dark-700">Socket activity</p>
          <div
            aria-live="polite"
            className="mt-2 max-h-48 min-h-16 space-y-1 overflow-auto font-mono text-xs text-dark-600"
          >
            {events.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              events.map((event) => (
                <p key={event.id} className="break-all">
                  <span className="mr-2 font-semibold text-primary-700">
                    {event.direction === "in" ? "IN" : event.direction === "out" ? "OUT" : "SYS"}
                  </span>
                  {event.text}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-dark-500">
        The simulator does not save your passkey. Disconnect it before connecting a physical device
        to the same sensor.
      </p>
    </section>
  );
};
