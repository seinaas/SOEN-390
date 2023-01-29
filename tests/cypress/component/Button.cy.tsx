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
  it('is transparent with a border when variant is secondary', () => {
    cy.mount(<Button variant='secondary'>Hello!</Button>);
    cy.contains('Hello!').should('have.class', 'border-primary-600 bg-transparent');
  });
  it('should have reverse colors when reverse is true', () => {
    cy.mount(<Button reverse>Hello!</Button>);
    cy.contains('Hello!').should('have.class', 'border-white bg-white');
  });
  it('should be secondary and have reverse colors when reverse and variant are true', () => {
    cy.mount(
      <Button reverse variant='secondary'>
        Hello!
      </Button>,
    );
    cy.contains('Hello!').should('have.class', 'border-white bg-transparent');
  });
  it('should have a left icon when iconLeft is passed', () => {
    cy.mount(<Button iconLeft={<div data-cy='icon' />}>Hello!</Button>);
    cy.dataCy('icon').should('exist');
  });
});
