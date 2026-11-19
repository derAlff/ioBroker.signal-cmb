"use strict";

const fs = require("fs");
const path = require("path");
const { expect } = require("chai");
const { HELP, COMMANDS } = require("./help");

/** The commands the message handler of main.js answers */
function commandsOfMain() {
	const source = fs.readFileSync(path.join(__dirname, "../main.js"), "utf8");
	const start = source.indexOf("message: (obj) =>");
	expect(start).to.be.greaterThan(0);
	return [...new Set([...source.slice(start).matchAll(/obj\.command === '([^']+)'/g)].map(m => m[1]))];
}

describe("help", () => {
	it("lists exactly the commands the message handler answers, each once", () => {
		const names = COMMANDS.map(c => c.command);
		expect(new Set(names).size).to.equal(names.length);
		expect([...names].sort()).to.deep.equal(commandsOfMain().sort());
	});

	it("marks only help as read-only", () => {
		for (const { command, write } of COMMANDS) {
			expect(write, command).to.equal(command !== "help");
		}
	});

	it("names every command for an agent", () => {
		for (const { command } of COMMANDS.filter(c => c.command !== "help")) {
			expect(HELP).to.include(`- ${command} `);
		}
		expect(HELP).to.include("sendTo signal-cmb.0");
		expect(HELP).to.include("How to talk to the user:");
	});

	it("keeps the lines short", () => {
		for (const line of HELP.split("\n")) {
			expect(line.length, line).to.be.at.most(120);
		}
	});
});
