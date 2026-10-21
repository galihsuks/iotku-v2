import { BookOpen, Cpu, ExternalLink, Info, RadioTower, Smartphone } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { AppLogo } from "../../components/shared/AppLogo";
import { usePageTitle } from "../../hooks/usePageTitle";
import envVar from "../../utils/envReader";
import { CodeBlock } from "./components/CodeBlock";
import { DeviceSimulator } from "./components/DeviceSimulator";
import {
  appSections,
  deviceSections,
  protocolRows,
  type GuideId,
  type GuideSection,
} from "./docsContent";

const guides: Array<{ id: GuideId; label: string; icon: typeof Cpu }> = [
  { id: "device", label: "Device developer", icon: Cpu },
  { id: "app", label: "App developer", icon: Smartphone },
  { id: "protocol", label: "Message reference", icon: BookOpen },
];

const GuideSteps = ({ sections }: { sections: GuideSection[] }) => (
  <div className="space-y-0">
    {sections.map((section) => (
      <section
        key={section.id}
        id={section.id}
        className="scroll-mt-24 border-t border-dark-200 py-7 first:border-t-0 first:pt-0"
      >
        <h2 className="text-base font-semibold text-dark-900 sm:text-lg">{section.title}</h2>
        <div className="mt-3 space-y-3 text-sm leading-7 text-dark-600">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {section.code ? (
          <div className="mt-4">
            <CodeBlock {...section.code} />
          </div>
        ) : null}
        {section.note ? (
          <p className="mt-4 border-l-2 border-info-500 bg-info-50 px-3 py-2 text-xs leading-6 text-dark-700">
            {section.note}
          </p>
        ) : null}
      </section>
    ))}
  </div>
);

const ProtocolReference = () => (
  <div className="space-y-8">
    <section id="protocol-map" className="scroll-mt-24">
      <h2 className="text-base font-semibold text-dark-900 sm:text-lg">Message map</h2>
      <p className="mt-2 text-sm leading-7 text-dark-600">
        HTTP is used for accounts, sensor setup, and history. WebSocket is used for live readings,
        device status, and commands.
      </p>
      <div className="mt-4 overflow-x-auto border-y border-dark-200">
        <table className="w-full min-w-[570px] text-left text-xs sm:text-sm">
          <thead className="bg-light-100 text-dark-700">
            <tr>
              <th className="px-3 py-3 font-semibold">Type</th>
              <th className="px-3 py-3 font-semibold">Direction</th>
              <th className="px-3 py-3 font-semibold">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100 text-dark-600">
            {protocolRows.map((row) => (
              <tr key={row.message}>
                <td className="px-3 py-3 font-mono text-dark-800">{row.message}</td>
                <td className="px-3 py-3">{row.from}</td>
                <td className="px-3 py-3">{row.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <section id="protocol-identifiers" className="scroll-mt-24 border-t border-dark-200 pt-8">
      <h2 className="text-base font-semibold text-dark-900 sm:text-lg">Identifiers and timing</h2>
      <dl className="mt-3 divide-y divide-dark-100 text-sm">
        <div className="grid gap-1 py-3 sm:grid-cols-[160px_1fr]">
          <dt className="font-mono font-medium text-dark-900">sensor_code</dt>
          <dd className="text-dark-600">
            Human-facing code, such as 00001. Use it in WebSocket handshake, subscribe, and command
            messages.
          </dd>
        </div>
        <div className="grid gap-1 py-3 sm:grid-cols-[160px_1fr]">
          <dt className="font-mono font-medium text-dark-900">sensor_id</dt>
          <dd className="text-dark-600">
            Internal database ID of the sensor. HTTP detail and history use this ID.
          </dd>
        </div>
        <div className="grid gap-1 py-3 sm:grid-cols-[160px_1fr]">
          <dt className="font-mono font-medium text-dark-900">reading.id</dt>
          <dd className="text-dark-600">Unique ID created by the server for each saved reading.</dd>
        </div>
        <div className="grid gap-1 py-3 sm:grid-cols-[160px_1fr]">
          <dt className="font-mono font-medium text-dark-900">command_id</dt>
          <dd className="text-dark-600">
            Unique ID created for a command. Return it in a device reading or command_result to link
            the response.
          </dd>
        </div>
        <div className="grid gap-1 py-3 sm:grid-cols-[160px_1fr]">
          <dt className="font-mono font-medium text-dark-900">recorded_at_ms</dt>
          <dd className="text-dark-600">
            Unix timestamp in milliseconds, not seconds. Optional when the device publishes a
            reading.
          </dd>
        </div>
      </dl>
    </section>

    <section id="protocol-examples" className="scroll-mt-24 border-t border-dark-200 pt-8">
      <h2 className="text-base font-semibold text-dark-900 sm:text-lg">
        A complete command exchange
      </h2>
      <p className="mt-2 text-sm leading-7 text-dark-600">
        The server acknowledges delivery first. Only a device response confirms execution.
      </p>
      <div className="mt-4 space-y-3">
        <CodeBlock
          label="1. App sends a command"
          language="json"
          value={'{ "type": "command", "idsensor": "00001", "value": "off" }'}
        />
        <CodeBlock
          label="2. Device receives it"
          language="json"
          value={
            '{ "type": "command", "success": true, "message": "Command received.", "data": { "command_id": "COMMAND_UUID", "sensor_code": "00001", "value": "off", "requested_at_ms": 1760000000000 } }'
          }
        />
        <CodeBlock
          label="3. Device reports actual state"
          language="json"
          value={
            '{ "value": "off", "command_id": "COMMAND_UUID", "recorded_at_ms": 1760000000000 }'
          }
        />
        <CodeBlock
          label="4. Sender receives the result"
          language="json"
          value={
            '{ "type": "command_result", "success": true, "message": "Device reported the requested state.", "data": { "command_id": "COMMAND_UUID", "sensor_code": "00001", "value": "off" } }'
          }
        />
      </div>
      <p className="mt-4 text-sm leading-7 text-dark-600">
        Every subscriber also receives sensor_reading containing the saved value. On failure, the
        device sends command_result with success=false and a message instead of publishing the
        requested value.
      </p>
    </section>

    <section id="protocol-access" className="scroll-mt-24 border-t border-dark-200 pt-8">
      <h2 className="text-base font-semibold text-dark-900 sm:text-lg">
        Access and connection notes
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-dark-600">
        <p>
          HTTP endpoints require a login cookie. Device WebSocket connections require the sensor
          passkey. App WebSocket subscriptions currently have no user authentication, so a client
          that knows a sensor code can subscribe or request commands. Use trusted test networks and
          avoid sensitive data until server-side WebSocket authorization is added.
        </p>
        <p>
          A browser page served over HTTPS needs a secure wss:// endpoint. localhost in a device or
          phone means that device itself; use the server's reachable hostname or IP. A separate web
          app origin must be allowed by the backend CORS setting for its HTTP cookie requests.
        </p>
      </div>
      <a
        href={`${String(envVar.BASE_URL_API ?? "http://localhost:8082").replace(/\/$/, "")}/docs`}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-600"
      >
        HTTP API reference <ExternalLink className="h-4 w-4" />
      </a>
    </section>
  </div>
);

export const DocsPage = () => {
  usePageTitle("Developer Guides");
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedGuide = searchParams.get("guide");
  const guide: GuideId =
    requestedGuide === "app" || requestedGuide === "protocol" ? requestedGuide : "device";
  const sections = guide === "device" ? deviceSections : guide === "app" ? appSections : [];
  const heading =
    guide === "device" ? "Build a device" : guide === "app" ? "Build an app" : "Message reference";
  const intro =
    guide === "device"
      ? "Connect hardware or the simulator, publish real values, and respond to commands."
      : guide === "app"
        ? "Use any web or mobile stack to show live data and control a device."
        : "Keep the HTTP and WebSocket contracts close while you build.";

  const chooseGuide = (next: GuideId) => {
    setSearchParams({ guide: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-light-50 text-dark-900">
      <header className="border-b border-dark-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/docs" className="flex min-w-0 items-center gap-2 font-semibold text-dark-900">
            <AppLogo variant="icon" className="h-8 w-8 shrink-0" />
            <span className="truncate">
              Iotku <span className="font-normal text-dark-500">/ Developer guides</span>
            </span>
          </Link>
          <Link
            to="/"
            className="shrink-0 text-xs font-medium text-primary-700 hover:text-primary-600 sm:text-sm"
          >
            Open app
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-0 px-4 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <aside className="border-b border-dark-200 py-5 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r lg:pr-5 lg:pt-8">
          <p className="mb-3 text-xs font-semibold text-dark-500">GUIDES</p>
          <nav aria-label="Developer guides" className="flex gap-1 overflow-x-auto lg:flex-col">
            {guides.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => chooseGuide(id)}
                aria-current={guide === id ? "page" : undefined}
                className={`flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-left text-xs font-medium transition sm:text-sm lg:w-full ${guide === id ? "bg-primary-50 text-primary-700" : "text-dark-600 hover:bg-light-100 hover:text-dark-900"}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-7 hidden lg:block">
            <p className="mb-2 text-xs font-semibold text-dark-500">ON THIS PAGE</p>
            <nav aria-label="On this page" className="space-y-1">
              {(guide === "protocol"
                ? [
                    { id: "protocol-map", title: "Message map" },
                    { id: "protocol-identifiers", title: "Identifiers" },
                    { id: "protocol-examples", title: "Command exchange" },
                    { id: "protocol-access", title: "Access notes" },
                  ]
                : sections.map(({ id, title }) => ({ id, title: title.replace(/^\d+\. /, "") }))
              ).map(({ id, title }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block rounded px-3 py-1.5 text-xs text-dark-500 hover:bg-light-100 hover:text-primary-700"
                >
                  {title}
                </a>
              ))}
              {guide === "device" ? (
                <a
                  href="#device-simulator"
                  className="block rounded px-3 py-1.5 text-xs text-dark-500 hover:bg-light-100 hover:text-primary-700"
                >
                  Device simulator
                </a>
              ) : null}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 pb-20 pt-7 sm:pt-9">
          <div className="mb-7 border-b border-dark-200 pb-6">
            <div className="flex items-center gap-2 text-xs font-medium text-primary-700">
              <RadioTower className="h-4 w-4" /> REALTIME IOT
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-dark-900 sm:text-3xl">{heading}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-dark-600">{intro}</p>
          </div>

          <div className="mb-7 flex items-start gap-2 border-l-2 border-primary-500 bg-primary-50 px-3 py-2 text-xs leading-6 text-dark-700">
            <Info className="mt-1 h-4 w-4 shrink-0 text-primary-700" />
            <p>
              Example sensor codes, timestamps, and credentials are placeholders. Use values
              assigned to your own test sensor. The default local API is{" "}
              <code>http://localhost:8082</code> and WebSocket is <code>ws://localhost:4002</code>.
            </p>
          </div>

          {guide === "protocol" ? <ProtocolReference /> : <GuideSteps sections={sections} />}
          {guide === "device" ? <DeviceSimulator /> : null}
          <div className="mt-10 border-t border-dark-200 pt-6 text-xs text-dark-500">
            Iotku developer guides · v{envVar.APP_VERSION}
          </div>
        </main>
      </div>
    </div>
  );
};
