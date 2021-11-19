import React from "react";
import { PageHeader, Ingress } from '@navikt/ds-react';
import "./SoknadWizard.less";

export type Step = {
  name: string;
}

type SoknadWizardProps = {
  title: string;
  ingress?: string;
  stepList: Step[];
  currentStepIndex: number;
  children?:
    | React.ReactChild
    | React.ReactChild[];
};


const SoknadWizard = ({title, ingress, stepList, currentStepIndex, children}: SoknadWizardProps) => {

  return (
    <>
      <header>
        <PageHeader align="center">{title}</PageHeader>
      </header>
      <Ingress spacing={true}>{ingress}</Ingress>
      <main className="soknad-wizard-main">{children}</main>
    </>
  );
};

export default SoknadWizard;
