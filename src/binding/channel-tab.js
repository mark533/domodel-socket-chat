import { Binding } from '../../lib/domodel/index.js'

export default class extends Binding {

	async onCreated() {
		const { irc, channel } = this.props
		const listeners = []
		listeners.push(irc.listen("channel set", _channel => {
			if (channel.name === _channel.name) {
				this.root.style.backgroundColor = "gray"
			} else {
				this.root.style.backgroundColor = ""
			}
		}))
		listeners.push(irc.listen("channel left", name => {
			if (name === channel.name ) {
				listeners.forEach(listener => irc.removeListener(listener))
				this.root.remove()
			}
		}))
		listeners.push(irc.listen("channel disconnected", name => {
			if (name === channel.name) {
				this.root.textContent = `(${name})`
			}
		}))
		listeners.push(irc.listen("channel reconnected", name => {
			if (name === channel.name) {
				this.root.textContent = this.root.textContent.substr(1, this.root.textContent.length - 2)
			}
		}))
		this.root.addEventListener("mouseup", event => {
			if(event.button === 0) {
				irc.channel = channel
				irc.emit("channel set", channel)
			} else if(event.button === 1) {
				irc.emit("channel leave", channel.name)
			}
		})
	}

}