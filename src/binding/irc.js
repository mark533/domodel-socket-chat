import { DOModel, Binding } from '../../lib/domodel/index.js'

import IRC from '../object/irc.js'

import TopicModel from '../model/topic.js'
import ChannelsListModel from '../model/channels-list.js'
import UsersListModel from '../model/users-list.js'
import MessageListModel from '../model/messages-list.js'
import InputBarModel from '../model/input-bar.js'

import TopicBinding from './topic.js'
import ChannelsListBinding from './channels-list.js'
import UsersListBinding from './users-list.js'
import MessageListBinding from './messages-list.js'
import InputBarBinding from './input-bar.js'

export default class extends Binding {

	async onCreated() {

		const webSocket = io("ws://localhost:3001");

		const irc = new IRC(webSocket)
		let disconnected = null
		await DOModel.run(ChannelsListModel, { parentNode: this.root, binding: new ChannelsListBinding({ irc }) })
		await DOModel.run(TopicModel, { parentNode: this.root, binding: new TopicBinding({ irc }) })
		await DOModel.run(MessageListModel, { parentNode: this.root, binding: new MessageListBinding({ irc }) })
		await DOModel.run(UsersListModel, { parentNode: this.root, binding: new UsersListBinding({ irc }) })
		await DOModel.run(InputBarModel, { parentNode: this.root, binding: new InputBarBinding({ irc }) })
		irc.emit("irc message", "Connecting...")
		irc.webSocket.on("connect", () => {
			irc.emit("irc message", "Connected.")
			irc.user.id = irc.webSocket.id
			irc.emit("input focus")
			if(disconnected === true) {
				irc.webSocket.emit("user nickname", irc.user.nickname)
				for (const channel of irc.channels) {
					irc.webSocket.emit("channel reconnect", channel.name)
				}
			}
			disconnected = false
		})
		irc.webSocket.on("disconnect", () => {
			irc.users = []
			irc.emit("irc message", "Disconnected.")
			irc.channel = null
			for (const channel of irc.channels) {
				channel.disconnected = true
				irc.emit("channel disconnected", channel.name)
			}
			disconnected = true
		})
		irc.listen("disconnect", () => {
			irc.webSocket.disconnect()
		})
		irc.listen("connect", () => {
			irc.webSocket.connect()
		})
		irc.listen("debug", () => {
			console.log(irc)
			console.log(irc.webSocket)
		})
	}

}