import { randomUUID } from "node:crypto";
import type { WebSocket } from "ws";
import { logWebSocket } from "./sensor-websocket.logger.js";
import { sendJson } from "./sensor-websocket.utils.js";

const COMMAND_TIMEOUT_MS = 30000;

type PendingCommand = {
  sender: WebSocket;
  device: WebSocket;
  sensorCode: string;
  value: string;
  timeout: NodeJS.Timeout;
};

const pendingCommands = new Map<string, PendingCommand>();
const completedCommands = new Map<string, WebSocket>();

const rememberCompleted = (commandId: string, device: WebSocket) => {
  completedCommands.set(commandId, device);
  setTimeout(() => completedCommands.delete(commandId), COMMAND_TIMEOUT_MS).unref();
};

const finishCommand = (
  commandId: string,
  command: PendingCommand,
  success: boolean,
  message: string,
) => {
  clearTimeout(command.timeout);
  pendingCommands.delete(commandId);
  rememberCompleted(commandId, command.device);
  sendResult(commandId, command, success, message);
};

const sendResult = (
  commandId: string,
  command: PendingCommand,
  success: boolean,
  message: string,
) => {
  sendJson(command.sender, {
    type: "command_result",
    success,
    message,
    data: {
      command_id: commandId,
      sensor_code: command.sensorCode,
      value: command.value,
    },
  });
};

export const registerCommand = (
  sender: WebSocket,
  device: WebSocket,
  sensorCode: string,
  value: string,
) => {
  if (
    Array.from(pendingCommands.values()).some(
      (command) => command.device === device && command.sensorCode === sensorCode,
    )
  ) {
    throw new Error("A command is already pending for this sensor.");
  }

  const commandId = randomUUID();
  const timeout = setTimeout(() => {
    const command = pendingCommands.get(commandId);
    if (!command) return;
    pendingCommands.delete(commandId);
    sendResult(commandId, command, false, "Device did not respond to the command in time.");
    void logWebSocket(
      "warning",
      "Device command timed out.",
      { command_id: commandId, sensor_code: command.sensorCode },
      null,
    );
  }, COMMAND_TIMEOUT_MS);

  pendingCommands.set(commandId, { sender, device, sensorCode, value, timeout });
  return commandId;
};

export const completeCommand = (
  device: WebSocket,
  commandId: string,
  success: boolean,
  message: string,
) => {
  const command = pendingCommands.get(commandId);
  if (!command || command.device !== device) return null;

  finishCommand(commandId, command, success, message);
  return { sensorCode: command.sensorCode, value: command.value };
};

export const wasCommandCompleted = (device: WebSocket, commandId: string) =>
  completedCommands.get(commandId) === device;

export const completeCommandFromReading = (
  device: WebSocket,
  sensorCode: string,
  value: string,
  requestedCommandId?: string,
) => {
  const entry = Array.from(pendingCommands.entries()).find(
    ([commandId, command]) =>
      command.device === device &&
      command.sensorCode === sensorCode &&
      command.value === value &&
      (!requestedCommandId || requestedCommandId === commandId),
  );
  if (!entry) return null;

  const [commandId, command] = entry;
  finishCommand(commandId, command, true, "Device reported the requested state.");
  return commandId;
};

export const clearSocketCommands = (socket: WebSocket) => {
  for (const [commandId, command] of pendingCommands) {
    if (command.device !== socket && command.sender !== socket) continue;
    clearTimeout(command.timeout);
    pendingCommands.delete(commandId);
    if (command.device === socket && command.sender !== socket) {
      sendResult(commandId, command, false, "Device disconnected before completing the command.");
      void logWebSocket(
        "warning",
        "Device disconnected before completing the command.",
        { command_id: commandId, sensor_code: command.sensorCode },
        null,
      );
    }
  }
};
