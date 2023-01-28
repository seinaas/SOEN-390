import React from 'react';
import { Button } from '../../../src/components/button';

describe('<Button />', () => {
  it('renders with custom text', () => {
    cy.mount(<Button>Hello!</Button>);
    cy.contains('Hello!');
  });
  it('fills container width if fullWidth is true', () => {
    cy.mount(
      <>
        <Button data-cy='button1' fullWidth>
          Hello!
        </Button>
        <Button data-cy='button2'>Hello!</Button>
      </>,
    );

    cy.dataCy('button1').should('have.class', 'w-full');
    cy.dataCy('button2').should('not.have.class', 'w-full');
  });
});
