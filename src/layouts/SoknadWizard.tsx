import React from "react";
import { PageHeader, Ingress } from '@navikt/ds-react';
import "./SoknadWizard.less";

type SoknadWizardProps = {
  title: string;
  ingress?: string;
  children?:
    | React.ReactChild
    | React.ReactChild[];
};


const SoknadWizard = ({title, ingress, children}: SoknadWizardProps) => {

  return (
    <>
      <PageHeader align="center">
        {title}
      </PageHeader>
      <Ingress spacing={true}>
        {ingress}
      </Ingress>
      <main className="soknad-wizard-main">
        {children}
      </main>
    </>
  );
};

export default SoknadWizard;
