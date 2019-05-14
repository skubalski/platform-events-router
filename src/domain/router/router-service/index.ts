import { Container } from 'typedi';
import { RouterService } from './service/RouterService';

const routerService = Container.get<RouterService>(RouterService);

routerService
  .run()
  // tslint:disable-next-line
  .catch(err => console.error(err));
