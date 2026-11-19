"use strict";

/*
 * The answer of the command "help": what the instance answers, written for AI agents (e.g. ioBroker.pi-agent, or the
 * MCP server with "send_to") and script authors. Keep it in sync with the message handler in main.js and the README.
 */

/** The commands the message handler answers; write = the command has an effect (sends a message) */
const COMMANDS = [
	{ command: "help", write: false },
	{ command: "send", write: true },
];

const HELP = `ioBroker.signal-cmb: sends Signal messages through the free CallMeBot service (for personal use), usually to
the user's own phone. An agent can send a text message; it cannot receive messages.

Commands (sendTo signal-cmb.0):
- send {text, phone?}: sends text to phone. A plain string as message is the text. phone: the number in
  international format (e.g. "+491234567890") or the GUID of CallMeBot; default the number of the settings.
  CallMeBot gives the API key of the settings for one number, other numbers usually fail.
  In text, the codes of the README (e.g. %F0%9F%98%80) become emojis and %0A a new line.
  Answer {result: "Message sent"} (also when nothing was sent because text or phone was empty) or {error}.
  Without an API key in the settings there is no answer.

States (signal-cmb.0.*): sendMessage: a text written there (ack false) is sent to the number of the settings.

How to talk to the user:
- Without a phone the message goes to the number of the settings (usually the user's own). Sending to other
  people than the user needs the user's explicit request; if the recipient is not clear, ask for the number.
- Send at most one message per second: CallMeBot blocks the sender for 15 minutes otherwise.
- Tell the user whether the message was sent; on {error} say why.`;

module.exports = { HELP, COMMANDS };
