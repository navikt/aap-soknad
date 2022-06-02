export const setErrorSummaryFocus = () => {
  const errorSummaryElement = document && document.getElementById('skjema-feil-liste');
  console.log('errorSummaryElement', errorSummaryElement);
  if (errorSummaryElement) errorSummaryElement.focus();
};
