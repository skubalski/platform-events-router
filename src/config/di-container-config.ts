import { Container } from 'typedi';
import { PostgresListenerAdapter } from '../infrastructure/adapter/PostgresListenerAdapter';
import { KafkaBrokerAdapter } from '../infrastructure/adapter/KafkaBrokerAdapter';
import { JSForceSalesforceConnector } from '../infrastructure/adapter/JSForceSalesforceConnector';

Container.import([
  PostgresListenerAdapter,
  KafkaBrokerAdapter,
  JSForceSalesforceConnector
]);
