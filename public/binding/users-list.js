import DOModel from '../lib/domodel/src/core.js'
import Binding from '../lib/domodel/src/binding.js'

import UserTabModel from '../model/user-tab.js'

import UserTabBinding from './user-tab.js'

import { socket } from './irc.js'

export default class extends Binding {

	async bind() {
		const {irc} = this.props
		socket.on("user joined", data => {
			const { user, users, channel } = data
			const index = irc.channels.findIndex(ch => ch.name === channel.name)
			irc.users = users
			irc.channels[index].users = channel.users
			if(irc.channel.name === channel.name) {
				this.identifier.counter.textContent = channel.users.length + " total"
				DOModel.run(UserTabModel, { parentNode: this.identifier.list, binding: new UserTabBinding({ irc, user, channel }), data: { irc, user, channel } })
			}
		});
		socket.on("user left", data => {
			const { channel, userId, users } = data
			const index = irc.channels.findIndex(ch => ch.name === channel.name)
			irc.users = users
			irc.channels[index].users = channel.users
			if (irc.channel.name === channel.name) {
				this.identifier.counter.textContent = irc.channel.users.length + " total"
				irc.emit("user left", data)
			}
		});
		socket.on("user renamed", data => {
			const { nickname, userId, users } = data
			irc.users = users
			const user = irc.getUserById(userId)
			user.nickname = nickname
			irc.emit("user renamed", { nickname, userId })
		})
		irc.listen("channel set", channel => {
			if(irc.channel.name !== channel.name) {
				return
			}
			if (channel.disconnected === true) {
				this.identifier.list.innerHTML = ''
				this.identifier.counter.textContent = ""
			} else {
				const users = irc.channel.users.map(userId => irc.getUserById(userId))
				this.root.style.display = "grid"
				this.identifier.list.innerHTML = ''
				this.identifier.counter.textContent = irc.channel.users.length + " total"
				for (const user of users) {
					DOModel.run(UserTabModel, { parentNode: this.identifier.list, binding: new UserTabBinding({ irc, user, channel: irc.channel }), data: { irc, user, channel: irc.channel } })
				}
			}
		})
		irc.listen("channel left", () => {
			if(irc.channels.length === 0) {
				this.root.style.display = "none"
			}
		})
		irc.listen("channel disconnected", () => {
			this.identifier.counter.innerHTML = ''
			this.identifier.list.innerHTML = ''
		})
		irc.listen("users list", () => {
			if (irc.channel === null) {
				irc.emit("irc message", "No channel joined. Try /join #<channel>")
			} else {
				irc.emit("irc message", irc.channel.users.map(userId => irc.getUserById(userId).nickname).join(", "))
			}
		})
	}
	
}