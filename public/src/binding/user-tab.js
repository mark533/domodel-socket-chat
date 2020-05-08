import { Binding } from '../../lib/domodel/index.js'

export default class extends Binding {

	async onCreated() {
		const { irc, channel, user } = this.props
		const listeners = []
		listeners.push(irc.listen("user renamed", data => {
			const { nickname, userId } = data
			if (userId === user.id) {
				this.root.textContent = `${irc.getUserPrefix(user, channel)}${nickname}`
			}
		}))
		listeners.push(irc.listen("user left", data => {
			const { userId } = data
			if (data.channel.name === irc.channel.name && userId === user.id) {
				listeners.forEach(listener => irc.removeListener(listener))
				this.root.remove()
			}
		}))
		listeners.push(irc.listen("channel disconnected", () => {
			listeners.forEach(listener => irc.removeListener(listener))
			this.root.remove()
		}))
		listeners.push(irc.listen("channel set", channel => {
			if(irc.channel.name !== channel.name) {
				return
			}
			listeners.forEach(listener => irc.removeListener(listener))
			this.root.remove()
		}))
		this.root.addEventListener("click", function() {
			irc.emit("input", { value: `/MSG ${user.nickname} `, focus: true})
		})
	}

}