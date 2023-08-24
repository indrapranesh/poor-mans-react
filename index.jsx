let React = {
  createElement: (tag, props, ...children) => {
    if (typeof tag == "function") {
      try {
        return tag(props);
      } catch ({ promise, key }) {
        promise.then((data) => {
          promiseCache.set(key, data);
          rerender();
        });
        return { tag: "h1", props: { children: ["I am loading"] } };
      }
    }
    var element = { tag, props: { ...props, children } };
    return element;
  },
};

const states = [];
let stateCursor = 0;

const useState = (initialState) => {
  const FROZEN_STATE = stateCursor;
  states[FROZEN_STATE] = states[FROZEN_STATE] || initialState;
  console.log(states);
  const setState = (newState) => {
    states[FROZEN_STATE] = newState;
    rerender();
  };
  stateCursor++;
  return [states[FROZEN_STATE], setState];
};

const promiseCache = new Map();
const createResource = (returningFunction, key) => {
  if (promiseCache.has(key)) return promiseCache.get(key);

  throw { promise: returningFunction(), key };
};

const App = () => {
  const [name, setName] = useState("Pranesh");
  const [count, setCount] = useState(0);
  const dogPhotoUrl = createResource(
    () =>
      fetch("https://dog.ceo/api/breeds/image/random")
        .then((res) => res.json())
        .then((payload) => payload.message),
    "dogPhoto"
  );

  return (
    <div className="hello">
      <h1>Hello {name}!</h1>
      <input
        value={name}
        onchange={(e) => {
          setName(e.target.value);
        }}
        type="text"
        placeholder="name"
      />
      <h2>Count: {count}</h2>
      <button onclick={(e) => setCount(count + 1)}>+</button>
      <img src={dogPhotoUrl} />
      <p>Welcome to Desconstructed React!</p>
    </div>
  );
};

const render = (element, container) => {
  const DOMElement = document.createElement(element?.tag);
  if (element?.props) {
    Object.keys(element?.props)
      .filter((key) => !["children", "__self", "__source"].includes(key))
      .forEach((p) => {
        DOMElement[p] = element.props[p];
      });
  }
  if (element?.props?.children) {
    element.props.children.forEach((child) => {
      render(child, DOMElement);
    });
  }
  if (["string", "number"].includes(typeof element)) {
    container.appendChild(document.createTextNode(element));
    return;
  }
  container.appendChild(DOMElement);
};

const rerender = () => {
  stateCursor = 0;
  document.querySelector("#app").firstChild.remove();
  render(<App />, document.querySelector("#app"));
};
render(<App />, document.querySelector("#app"));
