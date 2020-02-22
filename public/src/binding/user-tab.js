import { Binding } from '../../lib/domodel/index.js'

export default class extends Binding {

	async onCreated() {
		const { irc, channel, user } = this.props
		irc.listen("user renamed", data => {
			const { nickname, userId } = data
			if (userId === user.id) {
				this.root.textContent = `${irc.getUserPrefix(user, channel)}${nickname}`
			}
		})
		irc.listen("user left", data => {
			const { userId } = data
			if (data.channel.name === irc.channel.name && userId === user.id) {
				this.root.remove()
			}
		})
		this.root.addEventListener("click", function() {
			irc.emit("input", { value: `/MSG ${user.nickname} `, focus: true})
		})
	}

}