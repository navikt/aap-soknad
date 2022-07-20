import { useRouter } from 'next/router';
import React from 'react';
import { StepIntroduction } from '../../src/pages/utland/Steps';

const Utland = () => {
  const router = useRouter();
  return <StepIntroduction onSubmit={() => router.push('utland/1')} />;
};

export default Utland;
