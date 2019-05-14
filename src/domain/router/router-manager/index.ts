import { Container } from 'typedi';
import { RouterManagerService } from './service/RouterManagerService';

const routerManagerService: RouterManagerService = Container.get<RouterManagerService>(RouterManagerService);

routerManagerService
  .run()
  // tslint:disable-next-line
  .catch(err => console.error(err));
