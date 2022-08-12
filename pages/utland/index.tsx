import { useRouter } from 'next/router';
import React from 'react';
import { StepIntroduction } from 'components/pageComponents/utland/Steps';

const Utland = () => {
  const router = useRouter();
  return <StepIntroduction onSubmit={() => router.push('utland/1')} />;
};

export default Utland;
