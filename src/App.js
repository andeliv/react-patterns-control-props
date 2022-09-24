import { useState, useReducer } from "react";
import "./styles.css";
import { Switch } from "./Switch";

const ACTION_TYPE = {
  toggle: "TOGGLE",
  reset: "RESET"
};

function toggleReducer(state, { actionType, initialState }) {
  switch (actionType) {
    case ACTION_TYPE.toggle:
      return {
        ...state,
        on: !state.on
      };
    case ACTION_TYPE.reset:
      return initialState;
    default:
      throw new Error(`Unknown action type ${actionType}`);
  }
}

const callAll = (...fns) => (...args) => fns.forEach((fn) => fn?.(...args));

const useToggle = ({
  initialOn = false,
  reducer = toggleReducer,
  onChange,
  on: controlledOn
} = {}) => {
  const [initialState] = useState({ on: initialOn, internalField: false });
  const [state, dispatch] = useReducer(reducer, initialState);
  const isControlled = controlledOn != null;
  const on = isControlled ? controlledOn : state.on;

  function controlledDispatch(action) {
    if (!isControlled) {
      dispatch(action);
    }
    onChange?.(reducer({ ...state, on }, action), action);
  }

  const toggle = () => controlledDispatch({ actionType: ACTION_TYPE.toggle });
  const reset = () =>
    controlledDispatch({ actionType: ACTION_TYPE.reset, initialState });

  function getTogglerProps({ onClick, ...props } = {}) {
    return {
      "aria-pressed": on,
      onClick: callAll(toggle, onClick),
      ...props
    };
  }

  function getResetterProps({ onClick, ...props }) {
    return {
      onClick: callAll(reset, onClick),
      ...props
    };
  }

  return {
    on,
    getTogglerProps,
    getResetterProps
  };
};

function Toggle({ on: controlledOn, onChange }) {
  const { on, getTogglerProps } = useToggle({ on: controlledOn, onChange });
  const props = getTogglerProps({ on });
  return <Switch {...props} />;
}

function App() {
  const [timesClicked, setTimesClicked] = useState(0);
  const clickedTooMuch = timesClicked >= 4;
  const onClick = () => setTimesClicked((timesClicked) => timesClicked + 1);

  const [bothOn, setBothOn] = useState(false);
  function handleToggleChange(state, action) {
    if (action.actionType === ACTION_TYPE.toggle && clickedTooMuch) {
      return;
    }

    setBothOn(state.on);
    onClick();
  }

  function handleReset() {
    setBothOn(false);
    setTimesClicked(0);
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
      </div>
      <hr />
      {clickedTooMuch ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : timesClicked > 0 ? (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      ) : null}
      <button onClick={handleReset}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          onChange={(...args) =>
            console.info("Uncontrolled Toggle onChange", ...args)
          }
        />
      </div>
    </div>
  );
}

export default App;
