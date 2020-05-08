import { Binding } from '../../lib/domodel/index.js'

export default class extends Binding {

	async onCreated() {
		const { irc, channel } = this.props
		irc.listen("channel left", () => {
			this.identifier.topic.style.display = "none"
		})
		irc.listen("channel set", _channel => {
			this.identifier.topic.style.display = "block"
			this.identifier.topic.textContent = _channel.topic
		})
		irc.webSocket.on("channel topic", data => {
			const { topic } = data
			this.identifier.topic.textContent = topic
		});
	}

}