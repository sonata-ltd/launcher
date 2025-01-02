import { KeepAlive } from 'solid-keep-alive';
import { Component, JSX } from 'solid-js';

interface KeepAliveWrapperProps {
    id: string,
    children: JSX.Element;
}

const KeepAliveWrapper: Component<KeepAliveWrapperProps> = (props) => {
  return (
    <KeepAlive id={props.id}>
      {props.children}
    </KeepAlive>
  );
};

export default KeepAliveWrapper;
