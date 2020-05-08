export const STATE_SEARCHING = "STATE_SEARCHING"
export const STATE_FOUND_TOKEN = "STATE_FOUND_TOKEN"

export const PREFIXES = [
	{
		prefix: "#",
		type: "channel",
		characters: [..."abcdefghijklmnopqrstuvwxyz1234567890"]
	},
	{
		prefix: "@",
		type: "user",
		characters: [..."abcdefghijklmnopqrstuvwxyz1234567890-_"]
	},
]

export const tokenize =	function(text) {
	const characters = [...text]
	let state = STATE_SEARCHING
	const tokens = []
	let token = { buffer: "", bufferIndex: null }
	let prefix = null

	for(const [index, character] of characters.entries()) {
		if(character === " " || character === "\n") {
			tokens.push(token)
			tokens.push({ buffer: character, bufferIndex: index })
			token = { buffer: "", bufferIndex: index }
		} else {
			if(token.bufferIndex === null) {
				token.bufferIndex = index
			}
			token.buffer += character
		}
		if(index === characters.length -1) {
			if(prefix) {
				token.type = prefix.type
			}
			tokens.push(token)
		}
	}

	for(const token of tokens) {
		const prefix = PREFIXES.find(prefix_ => prefix_.prefix === token.buffer[0])
		if(prefix) {
			token.type = prefix.type
		}
	}

	for(const token of tokens) {
		const prefix = PREFIXES.find(prefix_ => prefix_.prefix === token.buffer[0])
		if(prefix) {
			if(token.buffer.length < 3) {
				delete token.type
			} else {
				for(const char of token.buffer.slice(prefix.prefix.length)) {
					if(prefix.characters.includes(char.toLowerCase()) === false) {
						delete token.type
						break
					}
				}
			}
		}
	}

	let mergedTextToken = null
	for (let i = 0; i < tokens.length; i++) {
		if (!tokens[i].type) {
			if (mergedTextToken === null) {
				mergedTextToken = tokens[i]
			} else {
				mergedTextToken.buffer += tokens[i].buffer
				tokens.splice(i, 1)
				i--
			}
		} else {
			mergedTextToken = null
		}
	}

	return tokens
}