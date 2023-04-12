declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    dataCy(value: string): Chainable<JQuery<HTMLElement>>;
    mount(reactNode: React.ReactNode, options?: MountOptions): Chainable<ReactWrapper>;
    uuid(): number;
    register(
      em?: string,
      pass?: string,
      fn?: string,
      ln?: string,
    ): Chainable<{ email: string; password: string; randomId: string }>;
  }
}
