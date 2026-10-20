import assert from "node:assert/strict";
import { test } from "node:test";
import { WebSocket } from "ws";
import {
  clearSocketCommands,
  completeCommand,
  completeCommandFromReading,
  registerCommand,
  wasCommandCompleted,
} from "../dist/websocket/sensor-websocket.commands.js";

const fakeSocket = () => {
  const messages = [];
  const socket = {
    readyState: WebSocket.OPEN,
    send: (data) => messages.push(JSON.parse(data)),
  };
  return { socket, messages };
};

test("command result reaches only its original sender and cannot be completed twice", () => {
  const sender = fakeSocket();
  const otherSender = fakeSocket();
  const device = fakeSocket();
  const otherDevice = fakeSocket();
  const commandId = registerCommand(sender.socket, device.socket, "00001", "open");

  assert.equal(completeCommand(otherDevice.socket, commandId, true, "Done."), null);
  assert.equal(sender.messages.length, 0);

  assert.deepEqual(completeCommand(device.socket, commandId, true, "Done."), {
    sensorCode: "00001",
    value: "open",
  });
  assert.deepEqual(sender.messages, [
    {
      type: "command_result",
      success: true,
      message: "Done.",
      data: { command_id: commandId, sensor_code: "00001", value: "open" },
    },
  ]);
  assert.equal(otherSender.messages.length, 0);
  assert.equal(completeCommand(device.socket, commandId, false, "Late result."), null);
});

test("sender disconnect removes its pending command", () => {
  const sender = fakeSocket();
  const device = fakeSocket();
  const commandId = registerCommand(sender.socket, device.socket, "00002", "off");

  clearSocketCommands(sender.socket);

  assert.equal(completeCommand(device.socket, commandId, true, "Done."), null);
  assert.equal(sender.messages.length, 0);
});

test("matching device reading completes a command and cancels its pending result", () => {
  const sender = fakeSocket();
  const device = fakeSocket();
  const otherDevice = fakeSocket();
  const commandId = registerCommand(sender.socket, device.socket, "00003", "off");

  assert.equal(completeCommandFromReading(otherDevice.socket, "00003", "off"), null);
  assert.equal(completeCommandFromReading(device.socket, "00003", "on"), null);
  assert.equal(sender.messages.length, 0);

  assert.equal(completeCommandFromReading(device.socket, "00003", "off"), commandId);
  assert.deepEqual(sender.messages, [
    {
      type: "command_result",
      success: true,
      message: "Device reported the requested state.",
      data: { command_id: commandId, sensor_code: "00003", value: "off" },
    },
  ]);
  assert.equal(wasCommandCompleted(device.socket, commandId), true);
  assert.equal(completeCommandFromReading(device.socket, "00003", "off"), null);
});

test("only one command per sensor waits for a device response", () => {
  const sender = fakeSocket();
  const device = fakeSocket();
  const commandId = registerCommand(sender.socket, device.socket, "00004", "open");

  assert.throws(
    () => registerCommand(sender.socket, device.socket, "00004", "close"),
    /already pending/,
  );
  assert.equal(completeCommandFromReading(device.socket, "00004", "open", "wrong-id"), null);
  assert.equal(completeCommandFromReading(device.socket, "00004", "open", commandId), commandId);
});
