import { DOModel } from '../lib/domodel/index.js'
import IRCModel from './model/irc.js'
import IRCBinding from './binding/irc.js'

window.addEventListener("load", function() {
	DOModel.run(IRCModel, {
		binding: new IRCBinding(),
		parentNode: document.body
	})
})
