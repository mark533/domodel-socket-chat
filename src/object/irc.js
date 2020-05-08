import { Observable } from '../../lib/domodel/index.js'

import * as MessageParser from '../../lib/message-parser.js'

export const PREFIX_CHANNEL = "#"
export const PREFIX_OWNER = "@"
export const DEFAULT_NICKNAME = "Anon"
export const DEFAULT_TOPIC = "Topic not set. Use /topic to change the topic."

const STATE_INITIALIZING = 0
const STATE_CHANNEL_VIEW = 1
const STATE_SERVER_VIEW = 2

export default class extends Observable {

	constructor() {
		super()
		this.state = STATE_INITIALIZING
		this.user = { nickname: DEFAULT_NICKNAME}
		this.users = [this.user]
		this.channels = []
		this.channel = null
		this.messages = []
	}

	get state() { return this._state }
	set state(state) { this._state = state }

	get user() { return this._user }
	set user(user) { this._user = user }

	get users() { return this._users }
	set users(users) { this._users = users }

	get channels() { return this._channels}
	set channels(channels) { this._channels = channels}

	get channel() { return this._channel }
	set channel(channel) { this._channel = channel }

	get messages() { return this._messages }
	set messages(messages) { this._messages = messages }

	getUserPrefix(user, channel) {
		if (user.id === channel.owner) {
			return PREFIX_OWNER
		}
		return ""
	}

	getUserById(id) {
		return this.users.find(user => user.id === id)
	}

	removeChannel(name) {
		const index = this.channels.findIndex(channel => channel.name === name)
		this.channels.splice(index, 1)
	}

	decorateMessage(text) {
		const tokens = MessageParser.tokenize(text)
		const message = {
			tagName: "span",
			children: []
		}
		for (const [index, token] of tokens.entries()) {
			if(token.type === "channel") {
				message.children.push({
					tagName: "a",
					href: "javascript:;",
					onclick: () => this.emit("channel join", token.buffer),
					textContent: token.buffer
				})
			} else if(token.type === "user") {
				message.children.push({
					tagName: "a",
					href: "javascript:;",
					onclick: () => this.emit("input", { value: `/MSG ${token.buffer.substring(1)} `, focus: true}),
					textContent: token.buffer
				})
			} else {
				message.children.push({
					tagName: "span",
					textContent: token.buffer
				})
			}
		}
		return message
	}


}