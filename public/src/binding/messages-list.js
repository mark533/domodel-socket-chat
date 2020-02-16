import DOModel from '../../lib/domodel/src/core.js'
import Binding from '../../lib/domodel/src/binding.js'

import MessageModel from '../model/message.js'

import { socket } from './irc.js'

export default class extends Binding {

	async bind() {
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
			if (irc.channel === null) {
				irc.messages.push(message)
				await DOModel.run(MessageModel, { parentNode: this.root, data: message })
			} else if(channel !== null) {
				irc.channels.find(ch => ch.name === channel.name).messages.push(message)
				if(irc.channel.name === channel.name) {
					await DOModel.run(MessageModel, { parentNode: this.root, data: message })
				}
			} else {
				irc.channel.messages.push(message)
				await DOModel.run(MessageModel, { parentNode: this.root, data: message })
			}
			this.root.scrollTop = this.root.scrollHeight
		})
		irc.listen("message send", message => {
			socket.emit("message send", { channelName: irc.channel.name, message})
		})    
		socket.on("message send", message => {
			irc.emit("message add", message)
		});
		irc.listen("channel set", channel => {
			if (irc.channel.name !== channel.name) {
				return
			}
			this.root.style.gridArea = "2 / 2" // TODO
			this.root.innerHTML = ''
			for (const message of channel.messages) {
				DOModel.run(MessageModel, { parentNode: this.root, data: message })
			}
		})
		irc.listen("channel left", () => {
			if (irc.channels.length === 0) {
				this.root.style.gridArea = "span 2 / 2" // TODO
				this.root.innerHTML = ''
				for (const message of irc.messages) {
					DOModel.run(MessageModel, { parentNode: this.root, data: message })
				}
			}
		})
	}
	
}