'use client';

import { useEffect } from 'react';

const umamiSporingskode = '09db40bf-ca75-4fc6-a9f1-dfe258ef5913';

export const UmamiScript = () => {
  useEffect(() => {
    loadTracker();
  }, []);

  return null;
};

function loadTracker() {
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://cdn.nav.no/team-researchops/sporing/sporing-dev.js';
  script.setAttribute('data-website-id', umamiSporingskode);
  document.head.appendChild(script);
}
