import 'reflect-metadata';
import { Container } from 'typedi';
import { RouterManagerService } from './service/RouterManagerService';
import '../../../config/di-container-config';

const routerManagerService: RouterManagerService = Container.get<RouterManagerService>(RouterManagerService);

routerManagerService
  .run();
