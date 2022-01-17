type RenderWhenTypes = {
  children: JSX.Element;
  when: boolean;
}

const RenderWhen = ({children, when}: RenderWhenTypes): JSX.Element | null => {

  if (when) {
    return children;
  }
  return null;
};

export { RenderWhen };
