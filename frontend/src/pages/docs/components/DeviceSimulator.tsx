import { Cable, Play, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, FormCheckbox, FormInput } from "../../../components/ui";
import envVar from "../../../utils/envReader";

type SimulatorEvent = { id: number; direction: "in" | "out" | "system"; text: string };
type CommandMessage = {
  type?: string;
  data?: { command_id?: string; value?: string };
};

type SimulatorForm = {
  url: string;
  sensorCode: string;
  passkey: string;
  value: string;
  autoReply: string[];
};

const autoReplyOptions = [
  { value: "enabled", label: "Automatically publish the requested value when a command arrives" },
];

export const DeviceSimulator = () => {
  const { control, setValue } = useForm<SimulatorForm>({
    defaultValues: {
      url: String(envVar.WS_URL ?? "ws://localhost:4002"),
      sensorCode: "",
      passkey: "",
      value: "off",
      autoReply: ["enabled"],
    },
  });
  const url = useWatch({ control, name: "url" });
  const sensorCode = useWatch({ control, name: "sensorCode" });
  const passkey = useWatch({ control, name: "passkey" });
  const value = useWatch({ control, name: "value" });
  const autoReply = useWatch({ control, name: "autoReply" }).includes("enabled");
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
          setValue("value", message.data.value);
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
          <h2 className="text-base md:text-lg font-semibold text-dark-900">
            Try the device simulator
          </h2>
          <p className="mt-1 text-xs leading-5 md:text-sm md:leading-6 text-dark-600">
            Test the protocol in your browser before connecting hardware. Use a test sensor and its
            passkey.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-dark-200 bg-white">
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <FormInput
            control={control}
            name="url"
            label="WebSocket URL"
            disabled={status !== "offline"}
            className="sm:col-span-2"
          />
          <FormInput
            control={control}
            name="sensorCode"
            label="Sensor code"
            placeholder="00001"
            disabled={status !== "offline"}
          />
          <FormInput
            control={control}
            name="passkey"
            type="password"
            label="Passkey"
            placeholder="Sensor passkey"
            disabled={status !== "offline"}
          />
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            {status === "offline" ? (
              <Button
                icon={Play}
                onClick={connect}
                disabled={!sensorCode.trim() || !passkey || !url.trim()}
              >
                Connect
              </Button>
            ) : (
              <Button icon={Square} variant="secondary-outline" onClick={disconnect}>
                Disconnect
              </Button>
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
            <FormInput
              control={control}
              name="value"
              label="Reading value"
              placeholder="off or 27.5"
              className="min-w-0 flex-1"
            />
            <Button
              icon={Send}
              variant="dark"
              onClick={publish}
              disabled={status !== "online" || !value.trim()}
            >
              Send reading
            </Button>
          </div>
          <FormCheckbox
            control={control}
            name="autoReply"
            options={autoReplyOptions}
            className="mt-3"
          />
        </div>

        <div className="border-t border-dark-200 p-4">
          <p className="text-[10px] md:text-xs font-semibold text-dark-700">Socket activity</p>
          <div
            aria-live="polite"
            className="mt-2 max-h-48 min-h-16 space-y-1 overflow-auto font-mono text-[10px] md:text-xs text-dark-600"
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
      <p className="mt-2 text-[10px] leading-5 md:text-xs md:leading-6 text-dark-500">
        The simulator does not save your passkey. Disconnect it before connecting a physical device
        to the same sensor.
      </p>
    </section>
  );
};
