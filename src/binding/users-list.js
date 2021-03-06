import { DOModel, Binding } from '../../lib/domodel/index.js'

import UserTabModel from '../model/user-tab.js'

import UserTabBinding from './user-tab.js'

export default class extends Binding {

	async onCreated() {
		const {irc} = this.props
		irc.webSocket.on("user joined", data => {
			const { user, users, channel } = data
			const index = irc.channels.findIndex(ch => ch.name === channel.name)
			irc.users = users
			irc.channels[index].users = channel.users
			if(irc.channel.name === channel.name) {
				this.identifier.counter.textContent = channel.users.length + " total"
				DOModel.run(UserTabModel({ irc, user, channel }), { parentNode: this.identifier.list, binding: new UserTabBinding({ irc, user, channel }) })
			}
		});
		irc.webSocket.on("user left", data => {
			const { channel, userId, users } = data
			const index = irc.channels.findIndex(ch => ch.name === channel.name)
			irc.users = users
			irc.channels[index].users = channel.users
			if (irc.channel.name === channel.name) {
				this.identifier.counter.textContent = irc.channel.users.length + " total"
				irc.emit("user left", data)
			}
		});
		irc.webSocket.on("user renamed", data => {
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
				this.identifier.counter.textContent = ""
			} else {
				const users = irc.channel.users.map(userId => irc.getUserById(userId))
				this.root.style.display = "grid"
				this.identifier.counter.textContent = irc.channel.users.length + " total"
				for (const user of users) {
					DOModel.run(UserTabModel({ irc, user, channel: irc.channel }), { parentNode: this.identifier.list, binding: new UserTabBinding({ irc, user, channel: irc.channel }) })
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