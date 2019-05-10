import { Container } from 'typedi';
import { RouterManagerService } from '../router/service/RouterManagerService';

const routerManagerService: RouterManagerService = Container.get(RouterManagerService);

routerManagerService
  .run()
  // tslint:disable-next-line
  .catch(err => console.log(err));
