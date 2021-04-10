import loader from '../loader'

const config = `
{
  "name": "View",
  "id": "container",
  "data": {
    "name": "bazx"
  },
  "supply": {
    "data": {
      "text": "{{$this.name}}"
    },
    "actions": {
      "onClick": "name => {\\n            setData(function(data) {\\n    console.log('000001', data);\\n          return Object.assign({}, data, {\\n                name: name,\\n              })\\n            }, {\\n              setToBlueprint: true,\\n            })\\n          }"
    }
  },
  "handlers": {
    "handler-01": "() => console.log('hello')"
  },
  "listeners": {
    "listener-01": "() => console.log('world')"
  },
  "render": "args => <div>abc</div>",
  "children": [
    {
      "name": "Text",
      "data": {
        "content": "{{$supply.$container.text}}"
      },
      "version": "0.0.1"
    },
    {
      "name": "Text",
      "data": {
        "content": "fooo"
      },
      "version": "0.0.1"
    },
    {
      "name": "View",
      "id": "container2",
      "supply": {
        "actions": {
          "onClick": "{{$supply.$container.onClick}}"
        }
      },
      "children": [
        {
          "name": "TextWithAction",
          "actions": {
            "click": "function($this, $supply) {\\n window.xx = $supply;\\n                 $supply.actions.$container2.onClick($this.data.content)\\n                }",
            "handleClick": "function($this, $supply) {\\n                  $this.actions.click($this, $supply)\\n                }"
          },
          "handlers": {
            "onClick": "{{$this.handleClick}}"
          },
          "data": {
            "content": "123456789"
          },
          "version": "0.0.1"
        }
      ],
      "version": "0.0.1"
    },
    {
      "name": "View",
      "children": [
        {
          "name": "Text",
          "data": {
            "content": "{{$supply.$container.text}}"
          },
          "version": "0.0.1"
        }
      ],
      "version": "0.0.1"
    }
  ],
  "version": "0.0.1"
}
`

test('load module correctly', () => {
  const fakeWebpack = {
    cacheable: false,
  }
  expect(loader.call(fakeWebpack, config)).toMatchSnapshot()
})
