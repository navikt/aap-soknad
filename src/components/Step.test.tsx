import { Step } from './Step';
import { render, screen } from '@testing-library/react';

const SimpleComponent = (): JSX.Element => (
  <section>
    <label htmlFor={'textfield'}>Tekstfelt</label>
    <input type={'text'} id={'textfield'} />
  </section>
);

describe('Step', () => {
  it('tegner komponent', () => {
    render(
      <Step renderWhen={true}>
        <SimpleComponent />
      </Step>
    );
    expect(screen.getByLabelText(/Tekstfelt/)).toBeInTheDocument();
  });

  it('tegner ikke komponent', () => {
    render(
      <Step renderWhen={false}>
        <SimpleComponent />
      </Step>
    );
    expect(screen.queryByLabelText(/Tekstfelt/)).not.toBeInTheDocument();
  });
});
