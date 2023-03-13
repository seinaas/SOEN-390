Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add('uuid', () => {
  return Cypress._.random(0, 1e6);
});
