import { DOModel, Binding } from '../../lib/domodel/index.js'

import MessageModel from '../model/message.js'

export default class extends Binding {

	async onCreated() {
		const { irc } = this.props
		irc.listen("irc message", message => {
			irc.emit("message add", { message: {
				message,
				time: new Date().getTime(),
				source: "---"
			} })
		})
		irc.listen("message add", async (data) => {
			const {message, channel = null} = data
			const replacedMessage = irc.decorateMessage(message.message)
			if (irc.channel === null) {
				irc.messages.push(message)
				await DOModel.run(MessageModel({ message, replacedMessage }), { parentNode: this.root })
			} else if(channel !== null) {
				irc.channels.find(ch => ch.name === channel.name).messages.push(message)
				if(irc.channel.name === channel.name) {
					await DOModel.run(MessageModel({ message, replacedMessage }), { parentNode: this.root })
				}
			} else {
				irc.channel.messages.push(message)
				await DOModel.run(MessageModel({ message, replacedMessage }), { parentNode: this.root })
			}
			this.root.scrollTop = this.root.scrollHeight
		})
		irc.listen("message send", message => {
			irc.webSocket.emit("message send", { channelName: irc.channel.name, message})
		})
		irc.webSocket.on("message send", message => {
			irc.emit("message add", message)
		});
		irc.listen("channel set", async channel => {
			if (irc.channel.name !== channel.name) {
				return
			}
			this.root.style.gridArea = "2 / 2" // TODO
			this.root.innerHTML = ''
			for (const message of channel.messages) {
				const replacedMessage = irc.decorateMessage(message.message)
				await DOModel.run(MessageModel({ message, replacedMessage }), { parentNode: this.root })
			}
		})
		irc.listen("channel left", async () => {
			if (irc.channels.length === 0) {
				this.root.style.gridArea = "span 2 / 2" // TODO
				this.root.innerHTML = ''
				for (const message of irc.messages) {
					const replacedMessage = irc.decorateMessage(message.message)
					await DOModel.run(MessageModel({ message, replacedMessage }), { parentNode: this.root })
				}
			}
		})
	}

}