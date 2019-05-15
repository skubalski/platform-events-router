import 'reflect-metadata';
import { Container } from 'typedi';
import { RouterService } from './service/RouterService';
import '../../../config/di-container-config';

const routerService = Container.get<RouterService>(RouterService);

routerService.run();
