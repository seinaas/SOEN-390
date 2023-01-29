import './index';

import { mount } from 'cypress/react18';

import 'tailwindcss/tailwind.css';

import '@bahmutov/cypress-code-coverage/support';

Cypress.Commands.add('mount', mount);
