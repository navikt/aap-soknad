interface StepType {
  renderWhen: boolean,
  children: JSX.Element
}

const Step = ({renderWhen, children}: StepType): JSX.Element | null => {
  if (!renderWhen) {
    return null;
  }
  return (children);
}

export { Step }
