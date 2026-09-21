import { EventEmitter } from "node:events";

export type SensorReadingCreatedEvent = {
  sensor_code: string;
  reading: unknown;
};

const sensorReadingEvents = new EventEmitter();

export const emitSensorReadingCreated = (event: SensorReadingCreatedEvent) => {
  sensorReadingEvents.emit("sensor-reading-created", event);
};

export const onSensorReadingCreated = (listener: (event: SensorReadingCreatedEvent) => void) => {
  sensorReadingEvents.on("sensor-reading-created", listener);
};
