import {DEFAULT_NICKNAME} from '../object/irc.js'

export default data => ({
  id: "input-bar",
  tagName: "div",
  style: "display: flex; grid-area: 3 / 2",
  children: [
    {
      tagName: "div",
      id: "nickname",
      children: [
        {
          tagName: "button",
          style: "border: none; background-color: transparent",
          _identifier: "buttonNick",
          textContent: `${DEFAULT_NICKNAME}`
        },
        {
          tagName: "div",
          _identifier: "popup",
          style: "position:absolute; display: none; place-items:center; height:100%; width:100%; top: 0; left: 0; background-color: #000000b3;",
          children: [
            {
              tagName: "div",
              className: "padding-large",
              style: "background-color: white",
              children: [
                {
                  tagName: "label",
                  textContent: "Enter new nickname:"
                },
                {
                  tagName: "div",
                  children: [
                    {
                      _identifier: "input_nick",
                      placeholder: "thoughtsuni ficator",
                      title: "(3 to 15 chars), alphanumerics and -_",
                      tagName: "input"
                    }
                  ]
                },
              ]
            }
          ]
        }
      ]
    },
    {
      id: "input",
      _identifier: "input",
      style: "flex-grow: 1",
      tagName: "input"
    }
  ]
})